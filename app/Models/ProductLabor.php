<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductLabor extends Model
{
    //
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function labor()
    {
        return $this->belongsTo(Labor::class);
    }
}
