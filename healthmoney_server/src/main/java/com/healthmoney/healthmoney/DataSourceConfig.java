package com.healthmoney.healthmoney;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource getDataSource() {
        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url("jdbc:postgresql://ep-restless-star-ac8enoor-pooler.sa-east-1.aws.neon.tech/healthmoneydb?sslmode=require")
                .username("neondb_owner")
                .password("npg_I5CNDXZ1yjRd")
                .build();
    }
}