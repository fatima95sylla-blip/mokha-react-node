package com.mokha.backend.services;

import com.mokha.backend.dao.ProductRepository;
import com.mokha.backend.entities.ProductEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CatalogService {

    private final ProductRepository productRepository;

    public CatalogService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Map<String, Object>> getProducts() {
        return productRepository.findAll().stream()
                .map(this::toProductMap)
                .toList();
    }

    public List<Map<String, Object>> getServices() {
        return List.of(
                Map.of(
                        "slug", "confection-sur-mesure",
                        "titre", "Confection sur mesure",
                        "prix", "À partir de 250 000 FCFA",
                        "description", "Une pièce unique construite à vos mesures, du croquis à l'essayage final."
                ),
                Map.of(
                        "slug", "conseil-en-stylisme",
                        "titre", "Conseil en stylisme",
                        "prix", "75 000 FCFA la séance",
                        "description", "Analyse de silhouette, palette de couleurs et construction d'un vestiaire cohérent."
                )
        );
    }

    public List<Map<String, Object>> getJournalEntries() {
        return List.of(
                Map.of(
                        "slug", "le-bazin-raconte",
                        "titre", "Le bazin raconté par celles qui le portent",
                        "categorie", "Héritage",
                        "date", "12 septembre 2026"
                ),
                Map.of(
                        "slug", "anatomie-d-un-drape",
                        "titre", "Anatomie d'un drapé",
                        "categorie", "Savoir-faire",
                        "date", "28 août 2026"
                )
        );
    }

    private Map<String, Object> toProductMap(ProductEntity product) {
        return Map.of(
                "id", product.getId(),
                "slug", product.getSlug(),
                "name", product.getName(),
                "price", product.getPrice(),
                "category", product.getCategory(),
                "collection", product.getCollection(),
                "coverImage", product.getCoverImage(),
                "description", product.getDescription(),
                "availability", product.getAvailability(),
                "featured", product.isFeatured()
        );
    }
}
