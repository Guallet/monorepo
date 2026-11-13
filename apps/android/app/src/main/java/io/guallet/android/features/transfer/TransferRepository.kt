package io.guallet.android.features.transfer

import io.guallet.android.core.network.apiJson
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.resources.*
import io.ktor.client.request.setBody
import io.ktor.resources.Resource
import kotlinx.serialization.encodeToString

@Resource("/data/import")
class ImportResource {
    @Resource("{jobId}")
    class Status(val parent: ImportResource = ImportResource(), val jobId: String)
}

@Resource("/data/export") class ExportResource

interface TransferRepository {
    suspend fun submit(request: ImportRequest): ImportResponse

    suspend fun status(jobId: String): ImportStatus

    suspend fun export(request: ExportRequest): ExportResponse
}

class KtorTransferRepository(private val client: HttpClient) : TransferRepository {
    override suspend fun submit(request: ImportRequest): ImportResponse {
        require(
            apiJson.encodeToString(request).toByteArray(Charsets.UTF_8).size <= 10 * 1024 * 1024
        ) {
            "Split this CSV into smaller files before importing."
        }
        return client.post(ImportResource()) { setBody(request) }.body()
    }

    override suspend fun status(jobId: String): ImportStatus =
        client.get(ImportResource.Status(jobId = jobId)).body()

    override suspend fun export(request: ExportRequest): ExportResponse =
        client.post(ExportResource()) { setBody(request) }.body()
}
