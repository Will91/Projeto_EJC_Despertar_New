import { Test } from '@nestjs/testing';
import { FinanceiroService } from '../financeiro.service';
import { FinanceiroRepository } from '../financeiro.repository';

/**
 * Teste unitário — não sobe banco nem HTTP, só verifica a regra de
 * negócio isolada (cálculo de saldo = entradas - saídas em centavos).
 * O repository é mockado, seguindo o princípio de que a service layer
 * não deve saber como o Prisma funciona por baixo (Clean Architecture).
 */
describe('FinanceiroService', () => {
  let service: FinanceiroService;
  let repository: jest.Mocked<FinanceiroRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FinanceiroService,
        {
          provide: FinanceiroRepository,
          useValue: {
            somaPorTipo: jest.fn(),
            createTransacao: jest.fn(),
            createCategoria: jest.fn(),
            findCategorias: jest.fn(),
            findTransacoes: jest.fn(),
            deleteTransacao: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(FinanceiroService);
    repository = module.get(FinanceiroRepository);
  });

  it('calcula o saldo como entradas menos saídas, em centavos', async () => {
    repository.somaPorTipo.mockResolvedValue({
      entradasCentavos: 510000, // R$ 5.100,00
      saidasCentavos: 286000, // R$ 2.860,00
    });

    const resultado = await service.saldo();

    expect(resultado.saldoCentavos).toBe(224000); // R$ 2.240,00
    expect(resultado.entradasCentavos).toBe(510000);
    expect(resultado.saidasCentavos).toBe(286000);
  });

  it('retorna saldo zero quando não há nenhuma transação', async () => {
    repository.somaPorTipo.mockResolvedValue({ entradasCentavos: 0, saidasCentavos: 0 });

    const resultado = await service.saldo();

    expect(resultado.saldoCentavos).toBe(0);
  });
});
