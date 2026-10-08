package com.mokha.backend.controllers;

import com.mokha.backend.services.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/catalog")
    public Map<String, Object> catalog() {
        return Map.of(
                "products", catalogService.getProducts(),
                "services", catalogService.getServices(),
                "journal", catalogService.getJournalEntries()
        );
    }
}
