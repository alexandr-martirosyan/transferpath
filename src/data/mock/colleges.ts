import type { College, ZipLocation } from '../../domain/types'

// Coordinates are real (approximate campus centroids). Expand to all CA public colleges later.
export const colleges: College[] = [
  // Community colleges (LA area)
  { id: 'gcc', name: 'Glendale Community College', short: 'GCC', type: 'CC', city: 'Glendale', lat: 34.1675, lng: -118.2271 },
  { id: 'pcc', name: 'Pasadena City College', short: 'PCC', type: 'CC', city: 'Pasadena', lat: 34.1444, lng: -118.1185 },
  { id: 'lavc', name: 'Los Angeles Valley College', short: 'LAVC', type: 'CC', city: 'Valley Glen', lat: 34.1766, lng: -118.4224 },
  { id: 'lacc', name: 'Los Angeles City College', short: 'LACC', type: 'CC', city: 'Los Angeles', lat: 34.0872, lng: -118.2923 },
  { id: 'elac', name: 'East Los Angeles College', short: 'ELAC', type: 'CC', city: 'Monterey Park', lat: 34.0418, lng: -118.1514 },
  { id: 'smc', name: 'Santa Monica College', short: 'SMC', type: 'CC', city: 'Santa Monica', lat: 34.0172, lng: -118.4697 },
  { id: 'piercecc', name: 'Los Angeles Pierce College', short: 'Pierce', type: 'CC', city: 'Woodland Hills', lat: 34.1834, lng: -118.5739 },
  { id: 'citrus', name: 'Citrus College', short: 'Citrus', type: 'CC', city: 'Glendora', lat: 34.1361, lng: -117.8853 },
  { id: 'mtsac', name: 'Mt. San Antonio College', short: 'Mt. SAC', type: 'CC', city: 'Walnut', lat: 34.0471, lng: -117.8448 },
  { id: 'riohondo', name: 'Rio Hondo College', short: 'Rio Hondo', type: 'CC', city: 'Whittier', lat: 34.0207, lng: -118.0331 },
  { id: 'coc', name: 'College of the Canyons', short: 'COC', type: 'CC', city: 'Santa Clarita', lat: 34.4053, lng: -118.5689 },
  { id: 'elcamino', name: 'El Camino College', short: 'ECC', type: 'CC', city: 'Torrance', lat: 33.8846, lng: -118.3305 },

  // University of California
  { id: 'ucb', name: 'UC Berkeley', short: 'UCB', type: 'UC', city: 'Berkeley', lat: 37.8719, lng: -122.2585 },
  { id: 'ucla', name: 'UCLA', short: 'UCLA', type: 'UC', city: 'Los Angeles', lat: 34.0689, lng: -118.4452 },
  { id: 'ucsd', name: 'UC San Diego', short: 'UCSD', type: 'UC', city: 'La Jolla', lat: 32.8801, lng: -117.234 },
  { id: 'uci', name: 'UC Irvine', short: 'UCI', type: 'UC', city: 'Irvine', lat: 33.6405, lng: -117.8443 },
  { id: 'ucd', name: 'UC Davis', short: 'UCD', type: 'UC', city: 'Davis', lat: 38.5382, lng: -121.7617 },
  { id: 'ucsb', name: 'UC Santa Barbara', short: 'UCSB', type: 'UC', city: 'Santa Barbara', lat: 34.414, lng: -119.8489 },
  { id: 'ucsc', name: 'UC Santa Cruz', short: 'UCSC', type: 'UC', city: 'Santa Cruz', lat: 36.9914, lng: -122.0609 },
  { id: 'ucr', name: 'UC Riverside', short: 'UCR', type: 'UC', city: 'Riverside', lat: 33.9737, lng: -117.3281 },
  { id: 'ucm', name: 'UC Merced', short: 'UCM', type: 'UC', city: 'Merced', lat: 37.3647, lng: -120.4241 },
]

export const zips: ZipLocation[] = [
  { zip: '91201', city: 'Glendale', lat: 34.1709, lng: -118.2894 },
  { zip: '91205', city: 'Glendale', lat: 34.1366, lng: -118.2437 },
  { zip: '91101', city: 'Pasadena', lat: 34.1468, lng: -118.1393 },
  { zip: '91401', city: 'Van Nuys', lat: 34.1789, lng: -118.4317 },
  { zip: '91367', city: 'Woodland Hills', lat: 34.1766, lng: -118.6155 },
  { zip: '90012', city: 'Los Angeles (Downtown)', lat: 34.0614, lng: -118.2385 },
  { zip: '90027', city: 'Los Feliz', lat: 34.1044, lng: -118.2925 },
  { zip: '90405', city: 'Santa Monica', lat: 34.0118, lng: -118.4733 },
  { zip: '91754', city: 'Monterey Park', lat: 34.0508, lng: -118.1438 },
  { zip: '91789', city: 'Walnut', lat: 34.0175, lng: -117.8568 },
  { zip: '91355', city: 'Valencia', lat: 34.4214, lng: -118.5934 },
  { zip: '90503', city: 'Torrance', lat: 33.8397, lng: -118.3546 },
]
