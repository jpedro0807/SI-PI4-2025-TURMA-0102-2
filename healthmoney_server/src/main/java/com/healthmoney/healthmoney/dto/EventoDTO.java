package com.healthmoney.healthmoney.dto;

public record EventoDTO(
        String titulo,
        String dataInicio, // Formato: "2023-12-25T10:00:00"
        String dataFim,    // Formato: "2023-12-25T11:00:00"
        String descricao
) {}