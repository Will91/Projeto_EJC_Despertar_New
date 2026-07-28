import { Controller, Get, Header, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { RelatoriosService } from './relatorios.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
@Roles(RoleName.ADMIN, RoleName.COORDENACAO)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly relatoriosService: RelatoriosService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('logs')
  findAuditLogs(@Query('entidade') entidade?: string) {
    return this.adminService.findAuditLogs(entidade);
  }

  @Get('encontros/:id/exportar/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="inscritos.xlsx"')
  async exportarExcel(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const buffer = await this.relatoriosService.exportarInscritosExcel(id);
    res.send(buffer);
  }

  @Get('encontros/:id/exportar/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="inscritos.pdf"')
  async exportarPdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const buffer = await this.relatoriosService.exportarInscritosPdf(id);
    res.send(buffer);
  }
}
