
/**
 * @fileOverview Centralized default configuration values for widgets.
 */

import type { AllWidgetConfigs, DroppedWidget, CarouselItem } from '@/types/widget';

// Helper type to extract config based on type string
type ConfigByType<T extends AllWidgetConfigs['type']> = Extract<AllWidgetConfigs, { type: T }>;

// Type assertion to ensure the map covers all expected widget types
type WidgetDefaultsMap = {
    [K in AllWidgetConfigs['type']]: Partial<ConfigByType<K>>;
};

// --- Default Base Config Values ---
const baseDefaults: Partial<AllWidgetConfigs> = {
    marginTop: 2,
    marginBottom: 2,
    animation: 'none',
    displayCondition: 'always',
    customCssClasses: '',
};

// Function to create default carousel items
const createDefaultCarouselItems = (): CarouselItem[] => [
    { id: `item-${Date.now()}-1`, imageUrl: 'https://picsum.photos/seed/carousel1/600/300', altText: 'Slide 1', linkUrl: '' },
    { id: `item-${Date.now()}-2`, imageUrl: 'https://picsum.photos/seed/carousel2/600/300', altText: 'Slide 2', linkUrl: '' },
    { id: `item-${Date.now()}-3`, imageUrl: 'https://picsum.photos/seed/carousel3/600/300', altText: 'Slide 3', linkUrl: '' },
];

export const widgetDefaultValuesMap: WidgetDefaultsMap = {
    header: {
        type: 'header', // Add type property
        title: 'App Name',
        showBackButton: false,
        showMenuButton: true,
        showCartIcon: true,
        showAuthButton: true,
        authButtonText: 'Login',
        // Headers usually don't use BaseWidgetConfig defaults
        marginTop: 0,
        marginBottom: 0,
        animation: 'none',
        displayCondition: 'always',
        customCssClasses: '',
    },
    banner: {
        ...baseDefaults, // Spread base defaults
        type: 'banner',
        imageUrl: 'https://picsum.photos/seed/banner_default/600/200',
        altText: 'Default Banner Image',
        linkUrl: '',
        imageFit: 'cover',
        aspectRatio: '16/9',
        aiPrompt: '', // Add AI prompt default
        imageUploadEnabled: false, // Add image upload flag
    },
    grid: {
        ...baseDefaults,
        type: 'grid',
        columns: '2',
        gap: 4,
        dataSource: '',
        itemAspectRatio: '1/1',
    },
    list: {
        ...baseDefaults,
        type: 'list',
        itemLayout: 'simple',
        showDividers: true,
        dataSource: '',
        imageSize: 'md',
    },
    form: {
        ...baseDefaults,
        type: 'form',
        submitButtonText: 'Submit',
        recipientEmail: '',
        successMessage: 'Thank you for your submission!',
    },
    text: {
        ...baseDefaults,
        type: 'text',
        content: 'This is a sample text block. Edit me!',
        fontSize: 'base',
        alignment: 'left',
        isBold: false,
        isItalic: false,
        textColor: 'default',
        aiPrompt: '', // Add AI prompt default
        enableRichText: false, // Add rich text flag
    },
    button: {
        ...baseDefaults,
        type: 'button',
        buttonText: 'Learn More',
        linkUrl: '',
        variant: 'default',
        size: 'default',
        alignment: 'center',
    },
    spacer: {
        ...baseDefaults,
        type: 'spacer',
        height: 4,
        // Override base margins for spacer
        marginTop: 0,
        marginBottom: 0,
    },
    map: {
        ...baseDefaults,
        type: 'map',
        address: '1 Infinite Loop, Cupertino, CA',
        zoomLevel: 15,
        showMarker: true,
        mapStyle: 'roadmap',
        useCurrentLocation: false, // Add geolocation flag
    },
    video: {
        ...baseDefaults,
        type: 'video',
        videoUrl: '',
        aspectRatio: '16/9',
        autoplay: false,
        showControls: true,
    },
    // --- NEW WIDGET DEFAULTS ---
    carousel: {
        ...baseDefaults,
        type: 'carousel',
        items: createDefaultCarouselItems(),
        autoplay: false,
        delay: 3000,
        showArrows: true,
        showDots: true,
        aspectRatio: '16/9',
    },
    audio: {
        ...baseDefaults,
        type: 'audio',
        audioUrl: '',
        autoplay: false,
        showControls: true,
        loop: false,
    },
    countdown: {
        ...baseDefaults,
        type: 'countdown',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week from now
        expiredMessage: 'Event has started!',
        labelDays: 'Days',
        labelHours: 'Hours',
        labelMinutes: 'Mins',
        labelSeconds: 'Secs',
        displayStyle: 'blocks',
    },
    social: { // Renamed type to 'social' for consistency
        ...baseDefaults,
        type: 'social',
        platform: 'twitter',
        profileUrlOrHandle: '',
        numberOfPosts: 5,
        layout: 'list',
    },
    divider: {
        ...baseDefaults,
        type: 'divider',
        style: 'solid',
        thickness: 1,
        color: 'border',
        // Override base margins for divider
        marginTop: 2,
        marginBottom: 2,
    },
};

// Add default values for app templates
export const appTemplateDefaults: Record<string, DroppedWidget[]> = {
    blank: [], // Start with no widgets for a blank slate
    blog: [
        { id: `header-${Date.now()}-blog`, type: 'header', name: 'Blog Header', config: widgetDefaultValuesMap.header },
        { id: `banner-${Date.now()}-blog`, type: 'banner', name: 'Featured Post Banner', config: { ...widgetDefaultValuesMap.banner, imageUrl: 'https://picsum.photos/seed/blog_banner/600/200', altText: 'Man writing on laptop' } },
        { id: `text-${Date.now()}-blog`, type: 'text', name: 'Welcome Title', config: { ...widgetDefaultValuesMap.text, content: 'Latest Articles', fontSize: 'xl', alignment: 'center', isBold: true, marginTop: 4, marginBottom: 2 } },
        { id: `list-${Date.now()}-blog`, type: 'list', name: 'Article Feed', config: { ...widgetDefaultValuesMap.list, itemLayout: 'image-left', showDividers: true, imageSize: 'md', marginTop: 2, marginBottom: 4, dataSource:'api/posts' } },
        { id: `divider-${Date.now()}-blog`, type: 'divider', name: 'Section Divider', config: { ...widgetDefaultValuesMap.divider, marginTop: 4, marginBottom: 4 } },
        { id: `text-${Date.now()}-blog-2`, type: 'text', name: 'About Section Title', config: { ...widgetDefaultValuesMap.text, content: 'About Us', fontSize: 'lg', alignment: 'left', isBold: true, marginTop: 4, marginBottom: 1 } },
        { id: `text-${Date.now()}-blog-3`, type: 'text', name: 'About Section Text', config: { ...widgetDefaultValuesMap.text, content: 'We share insights and stories about technology and design.', fontSize: 'sm', alignment: 'left', marginTop: 0, marginBottom: 4 } },
    ],
    store: [
      { id: `header-${Date.now()}-store`, type: 'header', name: 'Store Header', config: { ...widgetDefaultValuesMap.header, title: 'My Awesome Store'} },
      { id: `carousel-${Date.now()}-store`, type: 'carousel', name: 'Promotions Carousel', config: { ...widgetDefaultValuesMap.carousel, items: [
           { id: `item-${Date.now()}-s1`, imageUrl: 'https://picsum.photos/seed/store_promo1/600/300', altText: 'Summer Sale Banner', linkUrl: '' },
           { id: `item-${Date.now()}-s2`, imageUrl: 'https://picsum.photos/seed/store_promo2/600/300', altText: 'New Arrivals Poster', linkUrl: '' },
      ] } },
      { id: `text-${Date.now()}-store`, type: 'text', name: 'Featured Title', config: { ...widgetDefaultValuesMap.text, content: 'Featured Products', fontSize: 'xl', alignment: 'center', isBold: true, marginTop: 4, marginBottom: 2 } },
      { id: `grid-${Date.now()}-store`, type: 'grid', name: 'Product Grid', config: { ...widgetDefaultValuesMap.grid, columns: '2', gap: 3, marginTop: 2, marginBottom: 4, itemAspectRatio: '1/1', dataSource:'api/products' } },
      { id: `button-${Date.now()}-store`, type: 'button', name: 'Shop All Button', config: { ...widgetDefaultValuesMap.button, buttonText: 'View All Products', variant: 'primary', alignment: 'center', marginTop: 0, marginBottom: 4, size: 'lg', linkUrl:'/products' } },
       { id: `divider-${Date.now()}-store`, type: 'divider', name: 'Section Divider', config: { ...widgetDefaultValuesMap.divider, marginTop: 4, marginBottom: 4 } },
       { id: `list-${Date.now()}-store`, type: 'list', name: 'Categories List', config: { ...widgetDefaultValuesMap.list, itemLayout: 'simple', showDividers: false, imageSize: 'sm', marginTop: 2, marginBottom: 2, dataSource:'api/categories' } }, // Example category list
    ],
    // Add more templates like 'portfolio', 'event', etc.
};
