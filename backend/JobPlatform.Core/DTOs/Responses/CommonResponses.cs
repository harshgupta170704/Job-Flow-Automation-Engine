namespace JobPlatform.Core.DTOs.Responses;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public string? Error { get; set; }
    public object? Meta { get; set; }

    public static ApiResponse<T> Success(T data) => new() { Data = data };
    public static ApiResponse<T> Fail(string error) => new() { Error = error };
    public static ApiResponse<T> Paginated(T data, int total, int page, int pageSize) => 
        new() { Data = data, Meta = new PaginationMeta { TotalCount = total, Page = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(total / (double)pageSize) } };
}

public class PaginationMeta
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserResponse User { get; set; } = null!;
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
