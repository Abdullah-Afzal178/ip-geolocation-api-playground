const API_BASE_URL = "https://api.ipgeolocation.io";

export const CODE_LANGUAGES = [
  "python",
  "javascript",
  "php",
  "go",
  "ruby",
  "java",
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number];
export type EndpointId = "ipgeo" | "timezone" | "user-agent" | "astronomy" | "security";

type FieldOption = {
  value: string;
  description?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

type FormField =
  | {
      key: string;
      label: string;
      type: "text" | "number" | "date";
      placeholder?: string;
      hint?: string;
    }
  | {
      key: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      hint?: string;
      rows?: number;
    }
  | {
      key: string;
      label: string;
      type: "select";
      hint?: string;
      options: SelectOption[];
    }
  | {
      key: string;
      label: string;
      type: "checkbox-group";
      hint?: string;
      options: FieldOption[];
    };

type ParamSection = {
  group: "request" | "shape";
  title: string;
  description?: string;
  fields: FormField[];
};

type EndpointDefinition = {
  label: string;
  path: string;
  docsUrl: string;
  summary: string;
  defaults: Record<string, string | string[]>;
  paramSections: ParamSection[];
  snippetLanguages: Record<CodeLanguage, string>;
};

export type RequestParams = Record<string, string | string[]>;

export type PlaygroundRequestPayload = {
  endpointId: EndpointId;
  params: RequestParams;
};

const languageOptions: SelectOption[] = [
  { label: "English (en)", value: "en" },
  { label: "German (de)", value: "de" },
  { label: "Russian (ru)", value: "ru" },
  { label: "Japanese (ja)", value: "ja" },
  { label: "French (fr)", value: "fr" },
  { label: "Chinese Simplified (cn)", value: "cn" },
  { label: "Spanish (es)", value: "es" },
  { label: "Czech (cs)", value: "cs" },
  { label: "Italian (it)", value: "it" },
  { label: "Korean (ko)", value: "ko" },
  { label: "Persian (fa)", value: "fa" },
  { label: "Portuguese (pt)", value: "pt" },
];

const ipGeoIncludeOptions: FieldOption[] = [
  { value: "geo_accuracy", description: "Adds accuracy radius, confidence, and locality." },
  { value: "dma_code", description: "Adds DMA code when available." },
  { value: "user_agent", description: "Parses the supplied User-Agent header into a user_agent object." },
  { value: "security", description: "Includes IP security signals such as VPN, proxy, and bot flags." },
  { value: "abuse", description: "Adds abuse contact data for the queried IP." },
  { value: "hostname", description: "Adds hostname lookup data." },
  { value: "liveHostname", description: "Performs live hostname resolution." },
  { value: "hostnameFallbackLive", description: "Uses cached hostname and falls back to live resolution." },
];

const ipGeoFieldOptions: FieldOption[] = [
  { value: "ip" },
  { value: "location" },
  { value: "location.continent_code" },
  { value: "location.continent_name" },
  { value: "location.country_code2" },
  { value: "location.country_code3" },
  { value: "location.country_name" },
  { value: "location.country_name_official" },
  { value: "location.is_eu" },
  { value: "location.state_prov" },
  { value: "location.city" },
  { value: "location.zipcode" },
  { value: "location.latitude" },
  { value: "location.longitude" },
  { value: "location.country_flag" },
  { value: "currency" },
  { value: "currency.code" },
  { value: "currency.symbol" },
  { value: "time_zone" },
  { value: "time_zone.name" },
  { value: "time_zone.current_time" },
  { value: "time_zone.current_tz_abbreviation" },
  { value: "asn" },
  { value: "asn.as_number" },
  { value: "asn.organization" },
  { value: "company" },
  { value: "company.name" },
  { value: "security" },
  { value: "security.threat_score" },
  { value: "security.is_vpn" },
  { value: "security.is_proxy" },
  { value: "security.is_tor" },
  { value: "user_agent" },
  { value: "user_agent.name" },
  { value: "user_agent.device" },
  { value: "user_agent.operating_system" },
];

const securityFieldOptions: FieldOption[] = [
  { value: "ip" },
  { value: "security" },
  { value: "security.threat_score" },
  { value: "security.is_tor" },
  { value: "security.is_proxy" },
  { value: "security.proxy_provider_names" },
  { value: "security.proxy_confidence_score" },
  { value: "security.proxy_last_seen" },
  { value: "security.is_residential_proxy" },
  { value: "security.is_vpn" },
  { value: "security.vpn_provider_names" },
  { value: "security.vpn_confidence_score" },
  { value: "security.vpn_last_seen" },
  { value: "security.is_relay" },
  { value: "security.relay_provider_name" },
  { value: "security.is_anonymous" },
  { value: "security.is_known_attacker" },
  { value: "security.is_bot" },
  { value: "security.is_spam" },
  { value: "security.is_cloud_provider" },
  { value: "security.cloud_provider_name" },
];

export const ENDPOINTS: Record<EndpointId, EndpointDefinition> = {
  ipgeo: {
    label: "IP Geolocation",
    path: `${API_BASE_URL}/v3/ipgeo`,
    docsUrl: "https://ipgeolocation.io/documentation/ip-location-api.html",
    summary: "Lookup geolocation, timezone, ASN, currency, company, and optional enrichment data for an IP address.",
    defaults: {
      ip: "",
      lang: "en",
      include: [],
      fields: [],
      excludes: "",
      userAgent: "",
    },
    paramSections: [
      {
        group: "request",
        title: "Lookup Parameters",
        fields: [
          {
            key: "ip",
            label: "IP Address",
            type: "text",
            placeholder: "8.8.8.8",
            hint: "Leave blank to let the API detect the caller IP.",
          },
          {
            key: "lang",
            label: "Response Language",
            type: "select",
            hint: "Languages other than English usually require a paid plan.",
            options: languageOptions,
          },
        ],
      },
      {
        group: "shape",
        title: "Optional Modules",
        description: "These map to the include parameter for the IP Geolocation endpoint.",
        fields: [
          {
            key: "include",
            label: "Include",
            type: "checkbox-group",
            hint: "Select additional modules to append to the default response.",
            options: ipGeoIncludeOptions,
          },
          {
            key: "userAgent",
            label: "User-Agent Header",
            type: "textarea",
            rows: 3,
            placeholder:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...",
            hint: "Used when include=user_agent is selected. This header is sent server-side.",
          },
        ],
      },
      {
        group: "shape",
        title: "Response Filters",
        description: "Use fields for selective payloads and excludes for removing response keys.",
        fields: [
          {
            key: "fields",
            label: "fields",
            type: "checkbox-group",
            hint: "The playground builds a comma-separated fields query string from the selected paths.",
            options: ipGeoFieldOptions,
          },
          {
            key: "excludes",
            label: "excludes",
            type: "text",
            placeholder: "currency,location.continent_code",
            hint: "Comma-separated dot paths to remove from the response.",
          },
        ],
      },
    ],
    snippetLanguages: {
      python: "python",
      javascript: "javascript",
      php: "php",
      go: "go",
      ruby: "ruby",
      java: "java",
    },
  },
  timezone: {
    label: "Timezone",
    path: `${API_BASE_URL}/v3/timezone`,
    docsUrl: "https://ipgeolocation.io/documentation/timezone-api.html",
    summary: "Get current date, time, timezone metadata, and location details using timezone name, coordinates, address, or IP.",
    defaults: {
      tz: "",
      location: "",
      lat: "",
      long: "",
      ip: "",
      iata_code: "",
      icao_code: "",
      lo_code: "",
      lang: "en",
    },
    paramSections: [
      {
        group: "request",
        title: "Lookup Parameters",
        description: "Provide one lookup input. If several are filled, upstream priority rules determine which one is used.",
        fields: [
          {
            key: "tz",
            label: "Timezone Name",
            type: "text",
            placeholder: "America/Los_Angeles",
            hint: "IANA timezone identifier.",
          },
          {
            key: "location",
            label: "Location Address",
            type: "text",
            placeholder: "New York, USA",
          },
          {
            key: "ip",
            label: "IP Address",
            type: "text",
            placeholder: "1.1.1.1",
          },
          {
            key: "lat",
            label: "Latitude",
            type: "text",
            placeholder: "40.7128",
          },
          {
            key: "long",
            label: "Longitude",
            type: "text",
            placeholder: "-74.0060",
          },
          {
            key: "iata_code",
            label: "IATA Code",
            type: "text",
            placeholder: "DXB",
          },
          {
            key: "icao_code",
            label: "ICAO Code",
            type: "text",
            placeholder: "YSSY",
          },
          {
            key: "lo_code",
            label: "UN/LOCODE",
            type: "text",
            placeholder: "PKISB",
          },
        ],
      },
      {
        group: "request",
        title: "Localization",
        fields: [
          {
            key: "lang",
            label: "Response Language",
            type: "select",
            hint: "Only affects location names when location metadata is included in the response.",
            options: languageOptions,
          },
        ],
      },
    ],
    snippetLanguages: {
      python: "python",
      javascript: "javascript",
      php: "php",
      go: "go",
      ruby: "ruby",
      java: "java",
    },
  },
  "user-agent": {
    label: "User-Agent",
    path: `${API_BASE_URL}/v3/user-agent`,
    docsUrl: "https://ipgeolocation.io/documentation/user-agent-api.html",
    summary: "Parse a browser, crawler, or device User-Agent string into structured browser, engine, device, and OS metadata.",
    defaults: {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    },
    paramSections: [
      {
        group: "request",
        title: "Header Input",
        description: "The API reads the User-Agent from the request header, so the playground sends it from the server route.",
        fields: [
          {
            key: "userAgent",
            label: "User-Agent String",
            type: "textarea",
            rows: 5,
            placeholder: "Mozilla/5.0 (...)",
            hint: "Leave a realistic browser or bot string here. The URL itself does not carry this value.",
          },
        ],
      },
    ],
    snippetLanguages: {
      python: "python",
      javascript: "javascript",
      php: "php",
      go: "go",
      ruby: "ruby",
      java: "java",
    },
  },
  astronomy: {
    label: "Astronomy",
    path: `${API_BASE_URL}/v3/astronomy`,
    docsUrl: "https://ipgeolocation.io/documentation/astronomy-api.html",
    summary: "Return sunrise, sunset, moon phases, and related astronomy data for a location, IP, or coordinates.",
    defaults: {
      location: "",
      ip: "",
      lat: "",
      long: "",
      date: "",
      elevation: "",
      time_zone: "",
      lang: "en",
    },
    paramSections: [
      {
        group: "request",
        title: "Lookup Parameters",
        description: "Coordinates take precedence over location, and location takes precedence over IP when several inputs are provided.",
        fields: [
          {
            key: "location",
            label: "Location Address",
            type: "text",
            placeholder: "New York, USA",
          },
          {
            key: "ip",
            label: "IP Address",
            type: "text",
            placeholder: "8.8.8.8",
          },
          {
            key: "lat",
            label: "Latitude",
            type: "text",
            placeholder: "40.76473",
          },
          {
            key: "long",
            label: "Longitude",
            type: "text",
            placeholder: "-74.00084",
          },
          {
            key: "date",
            label: "Date",
            type: "date",
            hint: "Format: YYYY-MM-DD",
          },
          {
            key: "elevation",
            label: "Elevation (meters)",
            type: "number",
            placeholder: "10",
          },
          {
            key: "time_zone",
            label: "Convert Output Timezone",
            type: "text",
            placeholder: "Europe/London",
            hint: "Keeps the astronomy calculation tied to the original location but converts event timestamps.",
          },
        ],
      },
      {
        group: "request",
        title: "Localization",
        fields: [
          {
            key: "lang",
            label: "Response Language",
            type: "select",
            hint: "Only affects place names when geolocation data is included.",
            options: languageOptions,
          },
        ],
      },
    ],
    snippetLanguages: {
      python: "python",
      javascript: "javascript",
      php: "php",
      go: "go",
      ruby: "ruby",
      java: "java",
    },
  },
  security: {
    label: "IP Security",
    path: `${API_BASE_URL}/v3/security`,
    docsUrl: "https://ipgeolocation.io/documentation/ip-security-api.html",
    summary: "Assess IP risk with threat score, VPN, proxy, Tor, relay, bot, spam, and cloud-provider signals.",
    defaults: {
      ip: "",
      fields: [],
      excludes: "",
    },
    paramSections: [
      {
        group: "request",
        title: "Lookup Parameters",
        fields: [
          {
            key: "ip",
            label: "IP Address",
            type: "text",
            placeholder: "2.56.188.34",
            hint: "Leave blank to assess the caller IP.",
          },
        ],
      },
      {
        group: "shape",
        title: "Response Filters",
        fields: [
          {
            key: "fields",
            label: "fields",
            type: "checkbox-group",
            hint: "Select only the security fields you want returned.",
            options: securityFieldOptions,
          },
          {
            key: "excludes",
            label: "excludes",
            type: "text",
            placeholder: "security.proxy_last_seen,security.vpn_last_seen",
            hint: "Comma-separated dot paths to omit from the response.",
          },
        ],
      },
    ],
    snippetLanguages: {
      python: "python",
      javascript: "javascript",
      php: "php",
      go: "go",
      ruby: "ruby",
      java: "java",
    },
  },
};

export const ENDPOINT_IDS = Object.keys(ENDPOINTS) as EndpointId[];

type RequestDetailResult = {
  url: string;
  maskedUrl: string;
  curlCommand: string;
  codeSnippets: Record<CodeLanguage, string>;
  headers: Record<string, string>;
};

function appendSearchParams(searchParams: URLSearchParams, params: RequestParams) {
  Object.entries(params).forEach(([key, value]) => {
    if (key === "userAgent" || value === "" || value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(","));
      }
      return;
    }

    searchParams.set(key, value);
  });
}

function escapeForSingleQuotes(input: string) {
  return input.replace(/'/g, `'\\''`);
}

function buildCurl(maskedUrl: string, headers: Record<string, string>) {
  const headerBits = Object.entries(headers)
    .filter(([, value]) => value)
    .map(([key, value]) => `-H '${key}: ${escapeForSingleQuotes(value)}'`);

  return [`curl -X GET '${maskedUrl}'`, ...headerBits].join(" \\\n  ");
}

function buildCodeSnippets(maskedUrl: string, headers: Record<string, string>) {
  const headerObject = JSON.stringify(headers, null, 2);
  const pythonHeaders = JSON.stringify(headers, null, 2);
  const javaHeaders = Object.entries(headers)
    .map(([key, value]) => `.header("${key}", "${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`)
    .join("\n      ");
  const phpHeaders = Object.entries(headers)
    .map(([key, value]) => `"${key}: ${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",\n        ");
  const goHeaderLines = Object.entries(headers)
    .map(([key, value]) => `req.Header.Set("${key}", "${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`)
    .join("\n\t");

  return {
    python: `import requests\n\nurl = "${maskedUrl}"\nheaders = ${pythonHeaders}\n\nresponse = requests.get(url, headers=headers, timeout=30)\nprint(response.status_code)\nprint(response.text)`,
    javascript: `const url = "${maskedUrl}";\nconst response = await fetch(url, {\n  method: "GET",\n  headers: ${headerObject}\n});\n\nconsole.log(response.status);\nconsole.log(await response.text());`,
    php: `<?php\n\n$ch = curl_init("${maskedUrl}");\ncurl_setopt_array($ch, [\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_HTTPHEADER => [\n        ${phpHeaders}\n    ],\n]);\n\n$response = curl_exec($ch);\n$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\ncurl_close($ch);\n\necho $httpCode . PHP_EOL;\necho $response;\n`,
    go: `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n)\n\nfunc main() {\n\treq, err := http.NewRequest(http.MethodGet, "${maskedUrl}", nil)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\t${goHeaderLines || "// No additional headers required"}\n\n\tresp, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tbody, err := io.ReadAll(resp.Body)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\n\tfmt.Println(resp.StatusCode)\n\tfmt.Println(string(body))\n}`,
    ruby: `require "net/http"\nrequire "uri"\n\nuri = URI("${maskedUrl}")\nrequest = Net::HTTP::Get.new(uri)\n${Object.entries(headers)
      .map(([key, value]) => `request["${key}"] = "${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
      .join("\n")}\n\nresponse = Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|\n  http.request(request)\nend\n\nputs response.code\nputs response.body`,
    java: `import java.io.IOException;\nimport java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Example {\n  public static void main(String[] args) throws IOException, InterruptedException {\n    HttpRequest request = HttpRequest.newBuilder()\n      .uri(URI.create("${maskedUrl}"))\n      ${javaHeaders || ""}\n      .GET()\n      .build();\n\n    HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());\n    System.out.println(response.statusCode());\n    System.out.println(response.body());\n  }\n}`,
  } satisfies Record<CodeLanguage, string>;
}

export function buildRequestDetails(
  endpointId: EndpointId,
  params: RequestParams,
  apiKey: string,
): RequestDetailResult {
  const endpoint = ENDPOINTS[endpointId];
  const url = new URL(endpoint.path);
  url.searchParams.set("apiKey", apiKey);
  appendSearchParams(url.searchParams, params);

  const headers: Record<string, string> = {};
  const userAgent = typeof params.userAgent === "string" ? params.userAgent.trim() : "";

  if (endpointId === "user-agent" || userAgent) {
    headers["User-Agent"] = userAgent || "Mozilla/5.0";
  }

  const maskedUrl = url.toString().replace(apiKey, "YOUR_API_KEY");
  const curlCommand = buildCurl(maskedUrl, headers);
  const codeSnippets = buildCodeSnippets(maskedUrl, headers);

  return {
    url: url.toString(),
    maskedUrl,
    curlCommand,
    codeSnippets,
    headers,
  };
}
