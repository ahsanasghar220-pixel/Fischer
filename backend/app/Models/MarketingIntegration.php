<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MarketingIntegration extends Model {
    protected $fillable = ["platform", "is_enabled", "config"];
    protected $casts = ["is_enabled" => "boolean", "config" => "array"];

    public static function getEnabled(): \Illuminate\Database\Eloquent\Collection {
        return static::where("is_enabled", true)->get();
    }

    public static function getPlatform(string $platform): ?static {
        return static::where("platform", $platform)->first();
    }
}
