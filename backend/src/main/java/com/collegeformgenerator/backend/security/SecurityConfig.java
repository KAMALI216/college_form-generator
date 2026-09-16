package com.collegeformgenerator.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/register-admin").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/templates/admin").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/templates/*/approve").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/templates/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/templates", "/api/templates/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/templates", "/api/templates/{id}/duplicate").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/templates/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/ocr/upload").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/ocr/generate-schema").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/ocr/process").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/submissions").hasRole("USER")
                .requestMatchers("/api/submissions/my", "/api/submissions/my-stats").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/submissions/admin").hasRole("ADMIN")
                .requestMatchers("/api/documents", "/api/documents/**").hasRole("USER")
                .requestMatchers("/api/student-profiles", "/api/student-profiles/**").hasRole("USER")
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
