package com.papertrading.dto;

import java.util.List;

public class PaginatedResponse<T> {
    private List<T> data;
    private int offset;
    private int limit;
    private int total;
    private int totalPages;
    private boolean hasMore;

    public PaginatedResponse(List<T> data, int offset, int limit, int total) {
        this.data = data;
        this.offset = offset;
        this.limit = limit;
        this.total = total;
        this.totalPages = (int) Math.ceil((double) total / limit);
        this.hasMore = (offset + limit) < total;
    }

    public List<T> getData() { return data; }
    public void setData(List<T> data) { this.data = data; }

    public int getOffset() { return offset; }
    public void setOffset(int offset) { this.offset = offset; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public boolean isHasMore() { return hasMore; }
    public void setHasMore(boolean hasMore) { this.hasMore = hasMore; }
}
