package com.healthmoney.healthmoney;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Garanta que esta linha está aqui!
                .csrf(csrf -> csrf.disable())
                // ADICIONAMOS ISSO: Ativa o Login Social
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/loginGoogle", true) // Pra onde vai depois de logar?
                );

        return http.build();
    }
}