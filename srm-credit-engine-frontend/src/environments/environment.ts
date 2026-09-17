/**
 * Aponta para o backend Spring Boot rodando localmente (mvn spring-boot:run).
 * Ajuste apiBaseUrl se sua aplicação Java rodar em outra porta.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
};
