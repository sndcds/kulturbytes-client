import type { LinkIcon } from '~/types/link'

export const FALLBACK_ICON: LinkIcon = {
    path: '/icons/link-45deg.svg',
    color: '#333',
}

export const LINK_ICONS: Record<string, LinkIcon> = {
    facebook: { path: '/icons/facebook.svg', color: '#1877F2' },
    instagram: { path: '/icons/instagram.svg', color: '#405DE6' },
    mastodon: { path: '/icons/mastodon.svg', color: '#6364FF' },
    bandcamp: { path: '/icons/bandcamp.svg', color: '#239FC2' },
    pdf: { path: '/icons/pdf.svg', color: '#F40F02' },
    spotify: { path: '/icons/spotify.svg', color: '#1DB954' },
    vimeo: { path: '/icons/vimeo.svg', color: '#1AB7EA' },
    youtube: { path: '/icons/youtube.svg', color: '#FF0000' },
    'twitter-x': { path: '/icons/twitter-x.svg', color: '#000' },
    deezer: { path: '/icons/deezer.svg', color: '#A238FF' },
    web: { path: '/icons/web.svg', color: '#333' },
    github: { path: '/icons/github.svg', color: '#333' },
    gitlab: { path: '/icons/gitlab.svg', color: '#FC6D26' },
    soundcloud: { path: '/icons/soundcloud.svg', color: '#FF5500' },
    uranus: { path: '/icons/uranus.svg', color: '#6D26FC' },
    kulturbytes: { path: '/icons/kulturbytes.svg', color: '#F20D5E' },
}

export type LinkType = keyof typeof LINK_ICONS