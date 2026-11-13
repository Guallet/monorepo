package io.guallet.android.features.transfer

import io.guallet.android.R
import io.guallet.android.core.network.apiJson
import io.guallet.android.core.state.*
import io.guallet.android.core.state.AppDispatchers
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.resources.*
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.content.TextContent
import io.ktor.resources.Resource
import kotlinx.coroutines.withContext
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

class KtorTransferRepository(
    private val client: HttpClient,
    private val dispatchers: AppDispatchers = AppDispatchers(),
) : TransferRepository {
    override suspend fun submit(request: ImportRequest): ImportResponse {
        val content =
            withContext(dispatchers.computation) {
                val encoded = apiJson.encodeToString(request)
                require(encoded.toByteArray(Charsets.UTF_8).size <= 10 * 1024 * 1024) {
                    throw UiMessageException(
                        uiMessage(
                            R.string.message_split_this_csv_into_smaller_files_before_importing
                        )
                    )
                }
                TextContent(encoded, ContentType.Application.Json)
            }
        return client.post(ImportResource()) { setBody(content) }.body()
    }

    override suspend fun status(jobId: String): ImportStatus =
        client.get(ImportResource.Status(jobId = jobId)).body()

    override suspend fun export(request: ExportRequest): ExportResponse =
        client.post(ExportResource()) { setBody(request) }.body()
}
