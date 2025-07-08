package com.techtack.blue.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class AppConfig {

    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
        .authorizeHttpRequests(authorize -> authorize
            // Public endpoints
            // .requestMatchers("/h2-console/**").permitAll()
            .requestMatchers("/auth/**").permitAll()
            .requestMatchers("/dashboard/**").permitAll()
            .requestMatchers("/stocks/**").permitAll()
            .requestMatchers("/market/**").permitAll()
            
            // Protected endpoints requiring authentication
            .requestMatchers("/trading/**").authenticated()
            .requestMatchers("/user-stocks/**").authenticated()
            .requestMatchers("/watchlists/**").authenticated()
            .requestMatchers("/users/**").authenticated()
            
            // // Legacy API endpoints
            // .requestMatchers("/api/**").authenticated()
            
            .anyRequest().permitAll()
        )
        .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class)
        .csrf().disable()
        .headers().frameOptions().disable().and()
        .cors().configurationSource(corsConfigurationSource()).and()
        .httpBasic().and().formLogin();
    return http.build();
}

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                CorsConfiguration cfg = new CorsConfiguration();
                cfg.setAllowedOrigins(Arrays.asList("http://localhost:3000/"));
                cfg.setAllowedMethods(Collections.singletonList("*"));
                cfg.setAllowCredentials(true);
                cfg.setAllowedHeaders(Collections.singletonList("*"));
                cfg.setExposedHeaders(Arrays.asList("Authorization"));
                cfg.setMaxAge(3600L);
                return cfg;
            }
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public AlphaVantageConfig alphaVantageConfig() {
        return new AlphaVantageConfig();
    }
}
