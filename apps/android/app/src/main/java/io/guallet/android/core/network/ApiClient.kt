package io.guallet.android.core.network

import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.cookies.CookiesStorage
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.resources.Resources
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

val apiJson = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
}

fun createApiClient(
    baseUrl: String,
    cookies: CookiesStorage,
    engine: HttpClientEngine = OkHttp.create(),
): HttpClient =
    HttpClient(engine) {
        expectSuccess = true
        followRedirects = false
        install(Resources)
        install(ContentNegotiation) { json(apiJson) }
        install(HttpCookies) { storage = cookies }
        install(HttpTimeout) {
            requestTimeoutMillis = 30_000
            connectTimeoutMillis = 15_000
        }
        defaultRequest {
            url(baseUrl.trimEnd('/') + "/")
            contentType(ContentType.Application.Json)
            // This is already trusted by Guallet's Better Auth configuration.
            headers.append("Origin", "guallet://")
        }
    }
