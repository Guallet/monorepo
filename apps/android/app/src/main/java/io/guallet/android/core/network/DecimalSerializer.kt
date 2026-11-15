package io.guallet.android.core.network

import java.math.BigDecimal
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.*

/** TypeORM decimal responses can be JSON strings; requests must be JSON numbers. */
@OptIn(ExperimentalSerializationApi::class)
object DecimalSerializer : KSerializer<BigDecimal> {
    override val descriptor = PrimitiveSerialDescriptor("Decimal", PrimitiveKind.DOUBLE)

    override fun deserialize(decoder: Decoder): BigDecimal =
        (decoder as JsonDecoder).decodeJsonElement().jsonPrimitive.content.toBigDecimal()

    override fun serialize(encoder: Encoder, value: BigDecimal) {
        (encoder as JsonEncoder).encodeJsonElement(JsonUnquotedLiteral(value.toPlainString()))
    }
}
