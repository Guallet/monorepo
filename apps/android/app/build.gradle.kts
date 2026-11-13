import java.net.URI

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

val apiBaseUrl = providers.gradleProperty("guallet.apiBaseUrl").orElse("https://localhost").get()
val apiOrigin = URI(apiBaseUrl)

require(
    apiOrigin.scheme == "https" &&
        apiOrigin.host != null &&
        apiOrigin.rawUserInfo == null &&
        apiOrigin.rawQuery == null &&
        apiOrigin.rawFragment == null &&
        apiOrigin.rawPath.orEmpty() in listOf("", "/")
) {
    "guallet.apiBaseUrl must be an HTTPS origin (Better Auth uses secure cookies)"
}

android {
    namespace = "io.guallet.android"
    compileSdk = 36
    defaultConfig {
        applicationId = "io.guallet.android"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
        buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl.trimEnd('/')}\"")
    }
    buildTypes {
        debug {
            applicationIdSuffix = ".dev"
            versionNameSuffix = "-dev"
        }
        release { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    testOptions { unitTests.isIncludeAndroidResources = true }
    packaging { resources.excludes += "/META-INF/{AL2.0,LGPL2.1}" }
}

kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.material3)
    implementation(libs.compose.preview)
    debugImplementation(libs.compose.tooling)
    implementation(libs.activity.compose)
    implementation(libs.lifecycle.compose)
    implementation(libs.lifecycle.viewmodel)
    implementation(libs.navigation.compose)
    implementation(libs.ktor.core)
    implementation(libs.ktor.okhttp)
    implementation(libs.ktor.resources)
    implementation(libs.ktor.content)
    implementation(libs.ktor.json)
    implementation(libs.koin.android)
    implementation(libs.koin.compose)
    implementation(libs.coroutines.android)
    implementation(libs.serialization.json)
    testImplementation(libs.junit)
    testImplementation(libs.robolectric)
    testImplementation(libs.compose.test)
    debugImplementation(libs.compose.test.manifest)
    testImplementation(libs.coroutines.test)
    testImplementation(libs.ktor.mock)
}

// Keep runtime UI tests reproducible and compatible with constrained local builders.
tasks.withType<Test>().configureEach {
    maxHeapSize = "512m"
    jvmArgs(
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "--add-opens=java.base/java.util=ALL-UNNAMED",
        "--add-opens=java.base/java.io=ALL-UNNAMED",
        "--add-opens=java.base/java.net=ALL-UNNAMED",
        "--add-opens=java.base/java.security=ALL-UNNAMED",
        "--add-opens=java.base/java.text=ALL-UNNAMED",
        "--add-opens=java.base/jdk.internal.access=ALL-UNNAMED",
        "--add-opens=java.desktop/java.awt.font=ALL-UNNAMED",
        "--add-opens=jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED",
    )
    systemProperty("robolectric.dependency.repo.url", "https://repo.maven.apache.org/maven2")
}
