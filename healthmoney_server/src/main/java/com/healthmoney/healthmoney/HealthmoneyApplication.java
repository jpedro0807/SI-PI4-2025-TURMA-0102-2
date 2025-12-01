package com.healthmoney.healthmoney;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class HealthmoneyApplication {

	public static void main(String[] args) {
		SpringApplication.run(HealthmoneyApplication.class, args);
	}

	// --- ADICIONE ESTE BLOCO ABAIXO ---
	@Bean
	public CommandLineRunner testarConexao(DataSource dataSource) {
		return args -> {
			try (Connection connection = dataSource.getConnection()) {
				System.out.println("----------------------------------------");
				System.out.println("✅ SUCESSO! CONEXÃO COM NEON REALIZADA!");
				System.out.println("URL: " + connection.getMetaData().getURL());
				System.out.println("----------------------------------------");
			} catch (Exception e) {
				System.err.println("❌ FALHA NA CONEXÃO: " + e.getMessage());
			}
		};
	}
}
