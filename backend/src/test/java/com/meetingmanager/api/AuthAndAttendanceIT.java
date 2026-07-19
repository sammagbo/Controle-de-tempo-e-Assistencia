package com.meetingmanager.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.JsonNode;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureTestRestTemplate
@Testcontainers
class AuthAndAttendanceIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @Autowired
    TestRestTemplate rest;

    private HttpHeaders json() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    // Faz login com o admin do seed (V2) e devolve o header Cookie da sessao.
    private HttpHeaders loginAsAdmin() {
        HttpEntity<String> req = new HttpEntity<>(
            "{\"email\":\"admin@meeting.local\",\"password\":\"password\"}", json());
        ResponseEntity<String> resp = rest.postForEntity("/api/v1/auth/login", req, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        HttpHeaders authed = json();
        authed.add(HttpHeaders.COOKIE, resp.getHeaders().getFirst(HttpHeaders.SET_COOKIE));
        return authed;
    }

    @Test
    void login_comCredenciaisValidas_retorna200EDefineCookie() {
        HttpEntity<String> req = new HttpEntity<>(
            "{\"email\":\"admin@meeting.local\",\"password\":\"password\"}", json());
        ResponseEntity<String> resp = rest.postForEntity("/api/v1/auth/login", req, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getHeaders().getFirst(HttpHeaders.SET_COOKIE)).contains("SESSION");
    }

    @Test
    void login_comSenhaErrada_retorna401() {
        HttpEntity<String> req = new HttpEntity<>(
            "{\"email\":\"admin@meeting.local\",\"password\":\"errada\"}", json());
        ResponseEntity<String> resp = rest.postForEntity("/api/v1/auth/login", req, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void me_semSessao_retorna403() {
        // Comportamento atual da API: sem AuthenticationEntryPoint configurado, o Spring
        // Security responde 403 (nao 401) a requisicoes sem sessao. Documentado como esta;
        // mudar para 401 exigiria alterar o SecurityConfig (fora do escopo desta fase).
        ResponseEntity<String> resp = rest.getForEntity("/api/v1/auth/me", String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void attendance_avulsa_postCalculaCountEGetListaPorIntervalo() throws Exception {
        HttpHeaders authed = loginAsAdmin();

        // POST assistencia avulsa
        HttpEntity<String> post = new HttpEntity<>("{\"presencial\":40,\"zoom\":8}", authed);
        ResponseEntity<JsonNode> created =
            rest.postForEntity("/api/v1/attendance", post, JsonNode.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(created.getBody().get("meeting_id").isNull()).isTrue();
        assertThat(created.getBody().get("count").asInt()).isEqualTo(48);

        // GET por intervalo cobrindo hoje
        String url = "/api/v1/attendance?start=2020-01-01T00:00:00Z&end=2100-01-01T00:00:00Z";
        HttpEntity<Void> get = new HttpEntity<>(authed);
        ResponseEntity<JsonNode> list =
            rest.exchange(url, HttpMethod.GET, get, JsonNode.class);
        assertThat(list.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(list.getBody().isArray()).isTrue();
        assertThat(list.getBody().size()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void attendance_comPresencialNegativo_retorna400() {
        HttpHeaders authed = loginAsAdmin();
        HttpEntity<String> post = new HttpEntity<>("{\"presencial\":-5,\"zoom\":0}", authed);
        ResponseEntity<String> resp = rest.postForEntity("/api/v1/attendance", post, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
