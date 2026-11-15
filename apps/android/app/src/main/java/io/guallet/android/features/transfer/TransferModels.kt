package io.guallet.android.features.transfer

import kotlinx.serialization.Serializable

@Serializable
data class FieldMappings(
    val account: String = "",
    val date: String,
    val amount: String,
    val description: String,
    val notes: String = "",
    val category: String = "",
)

@Serializable
data class AccountMapping(val name: String, val shouldCreate: Boolean, val id: String? = null)

@Serializable
data class CategoryMapping(val name: String, val shouldCreate: Boolean, val id: String? = null)

@Serializable
data class ImportRequest(
    val csvData: List<Map<String, String>>,
    val fieldMappings: FieldMappings,
    val accountMappings: Map<String, AccountMapping>,
    val categoryMappings: Map<String, CategoryMapping>,
    val format: String = "csv",
)

@Serializable
data class ImportResponse(
    val jobId: String,
    val message: String,
    val processedCount: Int = 0,
    val failedCount: Int = 0,
)

@Serializable
data class ImportStatus(
    val status: String,
    val progress: Double,
    val processedCount: Int,
    val failedCount: Int,
    val error: String? = null,
)

@Serializable
data class ExportRequest(
    val format: String,
    val accounts: List<String>? = null,
    val startDate: String? = null,
    val endDate: String? = null,
)

@Serializable data class ExportResponse(val message: String)

data class CsvData(val columns: List<String>, val rows: List<Map<String, String>>)
