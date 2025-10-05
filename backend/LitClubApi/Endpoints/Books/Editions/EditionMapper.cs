using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Books.Editions;

public static class EditionMapper
{
    public static EditionResponse ToResponse(this Edition edition) => new()
    {
        Id = edition.Id,
        Format = edition.Format.ToContract(),
        Publisher = edition.Publisher,
        PublicationDate = edition.PublicationDate,
        PrintLength = edition.PrintLength,
        Isbn13s = [.. edition.Isbn13s]
    };

    public static EditionFormatContract ToContract(this BookFormat format) => (EditionFormatContract)format;

    public static BookFormat ToDomain(this EditionFormatContract format) => (BookFormat)format;
}
