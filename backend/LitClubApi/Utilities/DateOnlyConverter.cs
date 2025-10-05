using System;
using Newtonsoft.Json;

namespace LitClubApi.Utilities;

/// <summary>
/// Newtonsoft.Json converter that serializes DateOnly values as ISO 8601 dates.
/// </summary>
public sealed class DateOnlyConverter : JsonConverter<DateOnly>
{
    private const string Format = "yyyy-MM-dd";

    public override void WriteJson(JsonWriter writer, DateOnly value, JsonSerializer serializer)
    {
        writer.WriteValue(value.ToString(Format));
    }

    public override DateOnly ReadJson(JsonReader reader, Type objectType, DateOnly existingValue, bool hasExistingValue,
        JsonSerializer serializer)
    {
        if (reader.Value is string stringValue && !string.IsNullOrWhiteSpace(stringValue))
        {
            return DateOnly.Parse(stringValue);
        }

        throw new JsonSerializationException("A valid ISO date string is required.");
    }
}
