package com.healthmoney.healthmoney.controller;

import com.google.api.services.calendar.model.Event;
import com.healthmoney.healthmoney.dto.EventoDTO;
import com.healthmoney.healthmoney.service.GoogleAgendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/agenda")
public class CalendarController {

    @Autowired
    private GoogleAgendaService agendaService;

    @Autowired
    private OAuth2AuthorizedClientService clientService; // Esse cara recupera o token

    // ROTA PARA CRIAR EVENTO
    @PostMapping("/criar")
    public String criarEvento(@RequestBody EventoDTO dto, OAuth2AuthenticationToken authentication) {
        // BLINDAGEM: Verifica se o usuário realmente está logado
        if (authentication == null) {
            return "⛔ ERRO: Você não está logado ou seu Cookie expirou. Faça login novamente no navegador.";
        }

        try {
            String accessToken = getAccessToken(authentication);
            Event eventoCriado = agendaService.criarEvento(accessToken, dto);
            return "✅ Evento criado com sucesso! ID: " + eventoCriado.getId();

        } catch (Exception e) {
            e.printStackTrace(); // Mostra o erro real no console
            return "Erro ao criar evento: " + e.getMessage();
        }
    }

    // ROTA PARA DELETAR EVENTO
    @DeleteMapping("/deletar/{id}")
    public String deletarEvento(@PathVariable String id, OAuth2AuthenticationToken authentication) {
        try {
            String accessToken = getAccessToken(authentication);
            agendaService.deletarEvento(accessToken, id);
            return "Evento " + id + " removido com sucesso.";
        } catch (Exception e) {
            return "Erro ao remover evento: " + e.getMessage();
        }
    }

    // Método auxiliar para extrair o token da sessão
    private String getAccessToken(OAuth2AuthenticationToken authentication) {
        OAuth2AuthorizedClient client = clientService.loadAuthorizedClient(
                authentication.getAuthorizedClientRegistrationId(),
                authentication.getName());
        return client.getAccessToken().getTokenValue();
    }
}