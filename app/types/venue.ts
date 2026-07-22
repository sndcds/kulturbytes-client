export interface VenueOrganization {
    uuid:string | null
    name:string
    webLink:string | null
    city:string | null
    country:string | null
}


export interface VenueSpace {
    uuid:string
    name:string
    type:string | null
    typeName:string | null

    description:string | null
    webLink:string | null

    buildingLevel:number | null
    areaSqm:number | null
    totalCapacity:number | null
    seatingCapacity:number | null
}


export interface Venue {
    uuid:string

    name:string

    type:string | null
    typeName:string | null

    openedAt:string | null
    closedAt:string | null

    street:string | null
    houseNumber:string | null
    postalCode:string | null
    city:string | null
    state:string | null
    country:string | null

    contactEmail:string | null
    contactPhone:string | null
    webLink:string | null

    description:string | null

    lon:number | null
    lat:number | null

    logoUrl:string | null
    lightThemeLogoUrl:string | null
    darkThemeLogoUrl:string | null

    mainPhotoUrl:string | null

    organization:VenueOrganization | null

    spaces:VenueSpace[]
}