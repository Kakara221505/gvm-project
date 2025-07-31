// commonTypes.ts

export enum RoomSize {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
    EXTRA_LARGE = 'extra-large'
}

export enum FilterName {
    BRANDS = 'brands',
    CAPACITIES = 'capacities',
    ENERGY_RATING = 'energyRating',
    PRICE = 'price',
    TYPE = 'type',
    FEATURE = 'feature',
    ROOM_SIZE = 'roomSize',
    NOISE_LEVEL = 'noiseLevel',
    AVAILABILITY = 'availability',
    AIR_PURIFICATION = 'airPurification',
    COOLING_CAPACITY = 'coolingCapacity',
    WARRANTY_PERIOD = 'warrantyPeriod',
    RATING = 'rating',
}

export interface Filters {
    [FilterName.BRANDS]: number[];
    [FilterName.CAPACITIES]: number[];
    [FilterName.ENERGY_RATING]: number[];
    [FilterName.PRICE]: number[];
    [FilterName.TYPE]: number[];
    [FilterName.FEATURE]: number[];
    [FilterName.ROOM_SIZE]: number[];
    [FilterName.NOISE_LEVEL]: number[];
    [FilterName.AVAILABILITY]: number[];
    [FilterName.AIR_PURIFICATION]: number[];
    [FilterName.COOLING_CAPACITY]: number[];
    [FilterName.WARRANTY_PERIOD]: number[];
    [FilterName.RATING]: number[];
}

export const InitialFilters: Filters = {
    [FilterName.BRANDS]: [],
    [FilterName.CAPACITIES]: [],
    [FilterName.ENERGY_RATING]: [],
    [FilterName.PRICE]: [],
    [FilterName.TYPE]: [],
    [FilterName.FEATURE]: [],
    [FilterName.ROOM_SIZE]: [],
    [FilterName.NOISE_LEVEL]: [],
    [FilterName.AVAILABILITY]: [],
    [FilterName.AIR_PURIFICATION]: [],
    [FilterName.COOLING_CAPACITY]: [],
    [FilterName.WARRANTY_PERIOD]: [],
    [FilterName.RATING]: [],
};

export interface ProductData {
    Name: string;
    Price: number;
    Sale_price: number;
    Description: string;
    Status: string;
    CategoryID: number;
    BrandID: number;
    Quantity: number;
    TableData: [];
    EnergyEfficiencyRatingID: number;
    UserID: number;
    Remote_control_type: string;
    Is_available: boolean;
    Cooling_technology: string;
    Noise_level_indoor: number;
    Room_size_suitability: string;
    Warranty_period: number;
    Is_new_arrival: boolean;
    Is_best_seller: boolean;
    Is_featured: boolean;
    Is_exclusive: boolean;
    Has_anti_bacterial_filter: boolean;
    Has_built_in_air_purifier: boolean;
    Has_dust_filter: boolean;
    Has_voice_control: boolean;
    Has_dehumidification: boolean;
    Has_eco_mode: boolean;
    Has_turbo_mode: boolean;
    Has_auto_cleaning: boolean;
    Has_sleep_mode: boolean;
    Is_wifi_enabled: boolean;
    Model_series: string;
    Production_year: number;
    Frequency: number;
    Voltage: number;
    Wattage: number;
    Condenser_coil: string;
    Cooling_capacity: number;
    Refrigerant: string;
    Indoor_unit_weight: number;
    Dimensions_indoor_height: number;
    Dimensions_indoor_width: number;
    Dimensions_indoor_depth: number;
    Outdoor_unit_weight: number;
    Dimensions_outdoor_height: number;
    Dimensions_outdoor_width: number;
    Dimensions_outdoor_depth: number;
    ProductMainImage: File | null; // Assuming this is a file type
    Noise_level_outdoor: number;
    Installation_type: string;
    Model_number: string;
    Is_price: boolean;
    Is_price_range: boolean;
    Min_price:number;
    Max_price: number;
    Meta_tag_title: string;
    Meta_tag_keywords: string;
    Meta_tag_description: string;
    colorOptions : [];
};


export const initialProductData: ProductData = {
    Name: null,
    Price: 0,
    Sale_price: 0,
    Description: '',
    Status: null,
    CategoryID: null,
    BrandID: null,
    Quantity: 0,
    TableData: [],
    EnergyEfficiencyRatingID: null,
    UserID: null,
    Remote_control_type: null,
    Is_available: false,
    Cooling_technology: null,
    Noise_level_indoor: null,
    Room_size_suitability: '',
    Warranty_period: null,
    Is_new_arrival: false,
    Is_best_seller: false,
    Is_featured: false,
    Is_exclusive: false,
    Has_anti_bacterial_filter: false,
    Has_built_in_air_purifier: false,
    Has_dust_filter: false,
    Has_voice_control: false,
    Has_dehumidification: false,
    Has_eco_mode: false,
    Has_turbo_mode: false,
    Has_auto_cleaning: false,
    Has_sleep_mode: false,
    Is_wifi_enabled: false,
    Model_series: null,
    Production_year: null,
    Frequency: null,
    Voltage: null,
    Wattage: null,
    Condenser_coil: null,
    Cooling_capacity: null,
    Refrigerant: null,
    Indoor_unit_weight: null,
    Dimensions_indoor_height: null,
    Dimensions_indoor_width: null,
    Dimensions_indoor_depth: null,
    Outdoor_unit_weight: null,
    Dimensions_outdoor_height: null,
    Dimensions_outdoor_width: null,
    Dimensions_outdoor_depth: null,
    ProductMainImage: null,
    Noise_level_outdoor: null,
    Installation_type: null,
    Model_number: null,
    Min_price:0,
    Max_price: 0,
    Is_price: false,
    Is_price_range: false,
    colorOptions: []
    
} as unknown as ProductData;

export const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];
  
