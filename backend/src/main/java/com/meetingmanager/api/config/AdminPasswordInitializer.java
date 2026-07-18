package com.meetingmanager.api.config;

import com.meetingmanager.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminPasswordInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminPasswordInitializer.class);
    private static final String ADMIN_EMAIL = "admin@meeting.local";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;

    public AdminPasswordInitializer(UserRepository userRepository,
                                    PasswordEncoder passwordEncoder,
                                    @Value("${ADMIN_PASSWORD:}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            return;
        }
        userRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(user -> {
            if (passwordEncoder.matches(adminPassword, user.getPasswordHash())) {
                log.info("ADMIN_PASSWORD ja vigente para {}", ADMIN_EMAIL);
                return;
            }
            user.setPasswordHash(passwordEncoder.encode(adminPassword));
            userRepository.save(user);
            log.info("Senha de {} atualizada via ADMIN_PASSWORD", ADMIN_EMAIL);
        }, () -> log.warn("Usuario {} nao encontrado; ADMIN_PASSWORD ignorada", ADMIN_EMAIL));
    }
}
