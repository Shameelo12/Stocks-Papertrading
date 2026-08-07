package com.papertrading.dto;

import jakarta.validation.constraints.Min;

public class PaginationRequest {
    @Min(value = 0, message = "Offset must be at least 0")
    private int offset = 0;

    @Min(value = 1, message = "Limit must be at least 1")
    private int limit = 20;

    public PaginationRequest() {}

    public PaginationRequest(int offset, int limit) {
        this.offset = offset;
        this.limit = limit;
    }

    public int getOffset() { return offset; }
    public void setOffset(int offset) { this.offset = offset; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
}
