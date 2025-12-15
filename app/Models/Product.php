<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'product_materials')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    public function labors()
    {
        return $this->belongsToMany(Labor::class, 'product_labors')
                    ->withPivot('hours')
                    ->withTimestamps();
    }

    public function productMaterials()
    {
        return $this->hasMany(ProductMaterial::class);
    }

    public function productLabors()
    {
        return $this->hasMany(ProductLabor::class);
    }

    public function calculateHpp(): float
    {
        if ($this->type === 'resale') {
            return (float) $this->buy_price;
        }

        // Calculate Material Cost
        $materialCost = $this->productMaterials->sum(function ($pm) {
            return ($pm->material->price ?? 0) * $pm->quantity;
        });

        // Calculate Labor Cost
        $laborCost = $this->productLabors->sum(function ($pl) {
            return ($pl->labor->rate ?? 0) * $pl->hours;
        });

        // Calculate Overhead per Unit
        $totalOverhead = \App\Models\Overhead::sum('cost');
        $capacity = $this->production_capacity > 0 ? $this->production_capacity : 1;
        $overheadPerUnit = $totalOverhead / $capacity;

        return $materialCost + $laborCost + $overheadPerUnit;
    }

    public function calculateSellingPrice(): float
    {
        if ($this->price && $this->price > 0) {
            return (float) $this->price;
        }

        $hpp = $this->calculateHpp();
        $margin = $this->profit_margin ?? 0;
        $profit = $hpp * ($margin / 100);
        return $hpp + $profit;
    }
}
