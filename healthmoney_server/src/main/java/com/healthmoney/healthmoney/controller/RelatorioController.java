package com.healthmoney.healthmoney.controller;

import com.healthmoney.healthmoney.domain.Despesa;
import com.healthmoney.healthmoney.dto.RelatorioFinanceiroDTO;
import com.healthmoney.healthmoney.repository.DespesaRepository;
import com.healthmoney.healthmoney.repository.NotaFiscalRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    @Autowired private NotaFiscalRepository notaFiscalRepository;
    @Autowired private DespesaRepository despesaRepository;

    @GetMapping("/mensal")
    public RelatorioFinanceiroDTO getRelatorioMensal(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano
    ) {
        // Se não passar mês/ano, usa o atual
        LocalDate dataBase = LocalDate.now();
        int m = (mes != null) ? mes : dataBase.getMonthValue();
        int a = (ano != null) ? ano : dataBase.getYear();

        // 1. RECEITAS (Vem das Notas Fiscais)
        BigDecimal receita = notaFiscalRepository.somaReceitaNoMes(a, m);
        if (receita == null) receita = BigDecimal.ZERO;

        // 2. DESPESAS (Vem da nova tabela)
        BigDecimal despesas = despesaRepository.somaDespesasNoMes(a, m);
        if (despesas == null) despesas = BigDecimal.ZERO;

        BigDecimal saldo = receita.subtract(despesas);

        // 3. GRÁFICOS (Categorias)
        List<RelatorioFinanceiroDTO.CategoriaValor> catReceitas = new ArrayList<>();
        catReceitas.add(new RelatorioFinanceiroDTO.CategoriaValor("Serviços Médicos", receita));

        List<RelatorioFinanceiroDTO.CategoriaValor> catDespesas = new ArrayList<>();
        // Mock de categorias de despesa para o gráfico não ficar vazio se não tiver dados
        if (despesas.compareTo(BigDecimal.ZERO) > 0) {
            catDespesas.add(new RelatorioFinanceiroDTO.CategoriaValor("Operacional", despesas));
        }

        return new RelatorioFinanceiroDTO(
                receita,
                despesas,
                saldo,
                BigDecimal.ZERO,
                catReceitas,
                catDespesas
        );
    }

    // ========= NOVO ENDPOINT: CADASTRAR DESPESA =========
    @PostMapping("/despesas")
    @ResponseStatus(HttpStatus.CREATED)
    public Despesa criarDespesa(@RequestBody NovaDespesaRequest request) {
        Despesa despesa = new Despesa();
        despesa.setDescricao(request.getDescricao());
        despesa.setCategoria(request.getCategoria());
        despesa.setValor(request.getValor());
        despesa.setDataPagamento(request.getDataPagamento());

        return despesaRepository.save(despesa);
    }

    // DTO para receber a despesa do frontend
    @Data
    public static class NovaDespesaRequest {
        private String descricao;
        private String categoria;
        private BigDecimal valor;
        // vai mapear o campo "dataPagamento" enviado no JSON
        private LocalDate dataPagamento;
    }
}
