'use client';

import { ProductCard } from './ProductCard';
import { mapProductToCard } from '@/lib/mock-data';
import type { Product, ProductCardData } from '@/types/product';
import { cn } from '@tbk/ui';

interface ProductGridProps {
  products: Product[] | ProductCardData[];
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
}

function isProductCardData(item: Product | ProductCardData): item is ProductCardData {
  return 'vendorName' in item;
}

export function ProductGrid({ products, className, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {products.map((product) => {
        const cardData = isProductCardData(product) 
          ? product 
          : mapProductToCard(product);
        
        return (
          <ProductCard
            key={cardData.id}
            id={cardData.id}
            name={cardData.name}
            price={cardData.price}
            compareAtPrice={cardData.compareAtPrice}
            currency={cardData.currency}
            images={cardData.images}
            vendorName={cardData.vendorName}
            vendorSlug={cardData.vendorSlug}
            rating={cardData.rating}
            reviewCount={cardData.reviewCount}
            isInStock={cardData.isInStock}
            discount={cardData.discount}
          />
        );
      })}
    </div>
  );
}
