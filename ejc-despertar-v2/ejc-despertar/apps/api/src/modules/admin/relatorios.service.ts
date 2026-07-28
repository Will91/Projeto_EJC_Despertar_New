import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { AdminRepository } from './admin.repository';

/**
 * Serviço dedicado a gerar arquivos (Excel/PDF) a partir dos dados —
 * separado do AdminService para manter a responsabilidade única
 * (SRP) e não misturar lógica de consulta com geração de documento.
 */
@Injectable()
export class RelatoriosService {
  constructor(private readonly repository: AdminRepository) {}

  async exportarInscritosExcel(encontroId: string): Promise<Buffer> {
    const inscritos = await this.repository.findInscritosParaExportacao(encontroId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inscritos');

    sheet.columns = [
      { header: 'Nome', key: 'nome', width: 28 },
      { header: 'Sobrenome', key: 'sobrenome', width: 22 },
      { header: 'Círculo', key: 'circulo', width: 16 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Telefone', key: 'telefone', width: 18 },
      { header: 'E-mail', key: 'email', width: 28 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const inscricao of inscritos) {
      sheet.addRow({
        nome: inscricao.pessoa.nome,
        sobrenome: inscricao.pessoa.sobrenome,
        circulo: inscricao.circulo?.nome ?? '—',
        status: inscricao.status,
        telefone: inscricao.pessoa.telefone ?? inscricao.pessoa.celular ?? '—',
        email: inscricao.pessoa.email ?? '—',
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async exportarInscritosPdf(encontroId: string): Promise<Buffer> {
    const inscritos = await this.repository.findInscritosParaExportacao(encontroId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).text('Lista de Inscritos — EJC Despertar', { align: 'center' });
      doc.moveDown();
      doc.fontSize(9).fillColor('#555').text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, {
        align: 'center',
      });
      doc.moveDown(1.5);

      doc.fontSize(11).fillColor('#000');
      inscritos.forEach((inscricao, index) => {
        doc.text(
          `${index + 1}. ${inscricao.pessoa.nome} ${inscricao.pessoa.sobrenome} — ` +
            `${inscricao.circulo?.nome ?? 'sem círculo'} — ${inscricao.status}`,
        );
      });

      doc.end();
    });
  }
}
