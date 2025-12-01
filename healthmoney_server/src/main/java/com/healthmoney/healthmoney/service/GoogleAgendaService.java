package com.healthmoney.healthmoney.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.healthmoney.healthmoney.dto.EventoDTO;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Service
public class GoogleAgendaService {

    private static final String APPLICATION_NAME = "HealthMoney";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    // Método auxiliar para criar o cliente da API autenticado
    private Calendar criarClienteGoogle(String accessToken) throws GeneralSecurityException, IOException {
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();

        // Monta a credencial usando apenas o Token que o Spring Security já pegou
        return new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, request -> request.getHeaders().setAuthorization("Bearer " + accessToken))
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    public Event criarEvento(String accessToken, EventoDTO dto) throws GeneralSecurityException, IOException {
        Calendar service = criarClienteGoogle(accessToken);

        Event event = new Event()
                .setSummary(dto.titulo())
                .setDescription(dto.descricao());

        // Converte as Strings para o formato DateTime do Google
        // Obs: O "-03:00" é o fuso horário (Brasília). Ajuste se necessário.
        DateTime startDateTime = new DateTime(dto.dataInicio() + "-03:00");
        EventDateTime start = new EventDateTime()
                .setDateTime(startDateTime)
                .setTimeZone("America/Sao_Paulo");
        event.setStart(start);

        DateTime endDateTime = new DateTime(dto.dataFim() + "-03:00");
        EventDateTime end = new EventDateTime()
                .setDateTime(endDateTime)
                .setTimeZone("America/Sao_Paulo");
        event.setEnd(end);

        // "primary" significa a agenda principal do usuário logado
        return service.events().insert("primary", event).execute();
    }

    public void deletarEvento(String accessToken, String eventId) throws GeneralSecurityException, IOException {
        Calendar service = criarClienteGoogle(accessToken);
        service.events().delete("primary", eventId).execute();
    }
}