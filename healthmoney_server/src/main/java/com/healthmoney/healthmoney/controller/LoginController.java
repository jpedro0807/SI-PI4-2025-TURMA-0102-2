package com.healthmoney.healthmoney.controller;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class LoginController {

    @GetMapping("/loginGoogle")
    public Map<String, Object> home(OAuth2AuthenticationToken token) {

        // Se o token vier nulo (usuário não logado), evitamos erro 500
        if (token == null) {
            return Map.of("erro", "Usuário não autenticado");
        }

        Map<String, Object> googleAttributes = token.getPrincipal().getAttributes();

        Map<String, Object> respostaJson = new HashMap<>();
        respostaJson.put("nome", googleAttributes.get("name"));
        respostaJson.put("email", googleAttributes.get("email"));
        respostaJson.put("foto", googleAttributes.get("picture"));
        respostaJson.put("id_google", googleAttributes.get("sub"));
        respostaJson.put("status", "conectado");

        return respostaJson;
    }
}

