import { conn } from "@src/lib/planetscale";
import { ChatCompletionCreateParams } from "openai/resources/chat";

export type TransformedData = {
  country_id: string;
  country_value: string;
  date: string;
  indicator_id: string;
  indicator_value: string;
  value: number | null;
};

export const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "get_member_info",
    description:
      "Retrieve the user's information from the Member table in the database.use markdown notation to display the image if an image field is present.",
    parameters: {
      properties: {
        name: {
          description:
            "Name of Member of Parliament (full name in Chinese characters, remove spaces between last name and first name)",
          type: "string",
        },
      },
      required: ["name"],
      type: "object",
    },
  },
  {
    name: "get_population",
    description:
      "Search the World Bank for the most current population data at this time by country.",
    parameters: {
      properties: {
        country_code: {
          description: "ISO 3166-1 alpha-3 format code for country name.",
          type: "string",
        },
      },
      required: ["country_code"],
      type: "object",
    },
  },
  {
    name: "meeting_list",
    description:
      "Retrieve meeting and speaker information from the Japanese Diet Meeting Minutes Retrieval System search API in the order of most recent meeting date.",
    parameters: {
      properties: {
        any: {
          description:
            "Specify the message to be included in the utterance. Example: 科学技術",
          type: "string",
        },
        nameOfMeeting: {
          description:
            "Set the text to be included in the meeting name. For example: 東日本大震災",
          type: "string",
        },
        speaker: {
          description:
            "Meetings can be searched by speaker name.Can be last name or first name; if full name, remove space between last name and first name. Example: 岸田文雄",
          type: "string",
        },
      },
      type: "object",
    },
  },
  {
    name: "get_gdp",
    description:
      "Search the World Bank for the most current GDP data at this time by country.",
    parameters: {
      properties: {
        country_code: {
          description: "ISO 3166-1 alpha-3 format code for country name.",
          type: "string",
        },
      },
      required: ["country_code"],
      type: "object",
    },
  },
  {
    name: "speech_list",
    description:
      "Retrieved from the search API of the Japanese Diet Proceedings Retrieval System, in order of newest to oldest, based on statements.",
    parameters: {
      properties: {
        any: {
          description:
            "Specify the message to be included in the utterance. Example: マイナンバー",
          type: "string",
        },
        speaker: {
          description:
            "Meetings can be searched by speaker name.Can be last name or first name; if full name, remove space between last name and first name. Example: 岸田文雄",
          type: "string",
        },
      },
      type: "object",
    },
  },
];

async function get_population(countryCode: string) {
  try {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json`
    );
    const result = await response.json();
    const data = result[1];

    if (!data) {
      return "申し訳ありませんが、国番号に対応するデータがないため、人口データを取得できませんでした。";
    }

    const transformedData: TransformedData[] = data.map((datum: any) => {
      return {
        country_id: datum.country.id,
        country_value: datum.country.value,
        date: datum.date,
        indicator_id: datum.indicator.id,
        indicator_value: datum.indicator.value,
        value: datum.value,
      };
    });

    transformedData.sort((a, b) => parseInt(a.date) - parseInt(b.date));

    return transformedData;
  } catch (e: any) {
    return `申し訳ありませんが、エラーにより人口データを取得できませんでした`;
  }
}

async function get_gdp(countryCode: string) {
  try {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`
    );
    const result = await response.json();
    const data = result[1];

    if (!data) {
      return "申し訳ありませんが、国番号に対応するデータがないため、GDPデータを取得できませんでした。";
    }

    const transformedData: TransformedData[] = data.map((datum: any) => {
      return {
        country_id: datum.country.id,
        country_value: datum.country.value,
        date: datum.date,
        indicator_id: datum.indicator.id,
        indicator_value: datum.indicator.value,
        value: datum.value,
      };
    });

    transformedData.sort((a, b) => parseInt(a.date) - parseInt(b.date));

    return transformedData;
  } catch (e: any) {
    return `申し訳ありませんが、エラーによりGDPデータを取得できませんでした`;
  }
}

async function get_member_info(name: string) {
  const query = "SELECT * FROM Member WHERE name = ? LIMIT 1";
  const params = [name];
  const data = await conn.execute(query, params);

  if (data.rows.length === 0) {
    return "申し訳ありませんが、議員情報が見つかりませんでした。";
  }

  return data.rows[0];
}

async function meeting_list(args: any) {
  const { any, nameOfMeeting, speaker } = args;

  // TODO: なにもargsがない場合の処理を書く

  const url =
    `https://kokkai.ndl.go.jp/api/meeting_list?recordPacking=json&maximumRecords=10` +
    `${
      nameOfMeeting ? "&nameOfMeeting=" + encodeURIComponent(nameOfMeeting) : ""
    }` +
    `${any ? "&any=" + encodeURIComponent(any) : ""}` +
    `${speaker ? "&speaker=" + encodeURIComponent(speaker) : ""}`;
  console.log(url);

  const res = await fetch(url);

  const json = await res.json();

  const newArray = json.meetingRecord.map((record: any) => {
    const speakers = Array.from(
      new Set(record.speechRecord.slice(1).map((speech: any) => speech.speaker))
    );
    return {
      info: `${record.nameOfHouse} ${record.nameOfMeeting} ${record.issue} ${record.date}`,
      meetingURL: record.meetingURL,
      speakers,
    };
  });

  return newArray;
}

async function speech_list(args: any) {
  const { any, speaker } = args;

  // TODO: なにもargsがない場合の処理を書く

  const url =
    `https://kokkai.ndl.go.jp/api/speech?maximumRecords=2&recordPacking=json` +
    `${any ? "&any=" + encodeURIComponent(any) : ""}` +
    `${speaker ? "&speaker=" + encodeURIComponent(speaker) : ""}`;

  const res = await fetch(url);

  const json = await res.json();

  // Map through the array and return a new array with the desired fields
  const newArray = json.speechRecord.map((record: any) => {
    return {
      info: `${record.nameOfHouse} ${record.nameOfMeeting} ${record.issue} ${record.date}`,
      meetingURL: record.meetingURL,
      speech: record.speech,
      speechURL: record.speechURL,
    };
  });

  return newArray;
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "get_member_info":
      return await get_member_info(args["name"]);
    case "get_population":
      return await get_population(args["country_code"]);
    case "get_gdp":
      return await get_gdp(args["country_code"]);
    case "meeting_list":
      return await meeting_list(args);
    case "speech_list":
      return await speech_list(args);
    default:
      return null;
  }
}
