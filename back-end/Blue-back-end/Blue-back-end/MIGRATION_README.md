# Market Index to Stock Migration

## Overview

This document describes the migration of market index functionality from separate model/service/repository classes to the existing Stock-related classes. This consolidation simplifies the codebase by treating market indices as a special type of stock.

## Changes Made

### Model Changes

- Updated `Stock.java` to include market index fields:
  - Added `isMarketIndex` boolean flag
  - Added `code` field for market index code
  - Added `change` and `changePercent` fields

### DTO Changes

- Updated `StockDto.java` to include market index fields:
  - Added `isMarketIndex` boolean flag
  - Added `code` field for market index code
  - Added `change` field for direct change value

### Repository Changes

- Updated `StockRepository.java` to include methods for market indices:
  - Added `findByCodeAndIsMarketIndexTrue` method
  - Added `findAllMarketIndices` method
  - Modified existing queries to filter out market indices

### Service Changes

- Updated `StockService.java` to include market index functionality:
  - Added methods from `MarketService`
  - Modified `convertToDto` to handle market indices differently

### Controller Changes

- Updated `StockController.java` and `DashboardController.java`:
  - Removed `MarketService` dependency
  - Updated endpoints to use `StockService` for market indices
  - Changed return types from `MarketIndexDto` to `StockDto`

### Database Migration

- Added migration script `V2__Migrate_Market_Indices_To_Stocks.sql` to:
  - Add new columns to the stocks table
  - Transfer data from market_indices to stocks
  - (Optionally) Drop the market_indices table after verification

## Removed Files

The following files are no longer needed and can be removed:

- `MarketIndex.java`
- `MarketIndexDto.java`
- `MarketService.java`
- `MarketIndexRepository.java`

## Next Steps

1. Run the application with the migration script to transfer data
2. Verify all market index functionality works correctly
3. Remove the commented DROP TABLE statement in the migration script
4. Remove the unused market index files