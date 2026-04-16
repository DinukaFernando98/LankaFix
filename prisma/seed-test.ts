/**
 * Test data seed: 100 users + 100 complaints across all departments.
 * Run with:  npm run db:seed-test
 */

import { PrismaClient, Status, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Sri Lanka data ────────────────────────────────────────────────────────────

const SL_FIRST_NAMES = [
  'Kasun', 'Nimali', 'Tharaka', 'Sanduni', 'Chatura', 'Dilini', 'Ruwan', 'Chamari',
  'Asanka', 'Priyanka', 'Madushani', 'Lahiru', 'Sachini', 'Isuru', 'Thilini', 'Dinesh',
  'Nadeesha', 'Harsha', 'Kushani', 'Nuwan', 'Iresha', 'Sampath', 'Gayani', 'Supun',
  'Malsha', 'Chanaka', 'Hiruni', 'Buddhika', 'Sachini', 'Pasan', 'Amaya', 'Kelum',
  'Thamali', 'Gayan', 'Sulochana', 'Ravindra', 'Anjali', 'Milinda', 'Dasuni', 'Vimukthi',
  'Hasini', 'Lakshan', 'Chathurika', 'Niroshan', 'Sewwandi', 'Janith', 'Udara', 'Rashmi',
  'Chamath', 'Nilufar',
]

const SL_LAST_NAMES = [
  'Perera', 'Silva', 'Fernando', 'Jayawardena', 'Wickramasinghe', 'Bandara', 'Rajapaksa',
  'Gunasekara', 'Dissanayake', 'Karunaratne', 'Pathirana', 'Senanayake', 'Weerasinghe',
  'Abeysekara', 'Ranasinghe', 'Munasinghe', 'Samaraweera', 'Herath', 'Kumarasinghe',
  'Liyanage', 'Wijesinghe', 'Jayasuriya', 'Gamage', 'Rathnayake', 'Mendis', 'Dias',
  'Seneviratne', 'Gunawardena', 'Marasinghe', 'Vithanage',
]

const SL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kandy', 'Galle', 'Matara', 'Kalutara', 'Kurunegala',
  'Ratnapura', 'Badulla', 'Anuradhapura', 'Polonnaruwa', 'Hambantota', 'Matale',
  'Nuwara Eliya', 'Kegalle', 'Trincomalee', 'Batticaloa', 'Jaffna', 'Vavuniya', 'Ampara',
]

// Approximate lat/lng centres per district
const DISTRICT_COORDS: Record<string, [number, number]> = {
  Colombo:        [6.9271,  79.8612],
  Gampaha:        [7.0873,  79.9996],
  Kandy:          [7.2906,  80.6337],
  Galle:          [6.0535,  80.2210],
  Matara:         [5.9496,  80.5353],
  Kalutara:       [6.5854,  79.9607],
  Kurunegala:     [7.4863,  80.3625],
  Ratnapura:      [6.6828,  80.3992],
  Badulla:        [6.9895,  81.0567],
  Anuradhapura:   [8.3114,  80.4037],
  Polonnaruwa:    [7.9403,  81.0188],
  Hambantota:     [6.1241,  81.1185],
  Matale:         [7.4700,  80.6234],
  'Nuwara Eliya': [6.9497,  80.7891],
  Kegalle:        [7.2513,  80.3464],
  Trincomalee:    [8.5874,  81.2152],
  Batticaloa:     [7.7170,  81.7003],
  Jaffna:         [9.6615,  80.0255],
  Vavuniya:       [8.7514,  80.4997],
  Ampara:         [7.2966,  81.6747],
}

const SL_STREET_TYPES = ['Road', 'Street', 'Lane', 'Avenue', 'Place', 'Mawatha']
const SL_PLACE_WORDS = [
  'Temple', 'Market', 'Junction', 'School', 'Station', 'Bazaar', 'Park',
  'Garden', 'Canal', 'Bridge', 'Lake', 'Town Hall', 'Hospital', 'Church',
]

// ── Complaint content per category ───────────────────────────────────────────

const COMPLAINT_CONTENT: Record<string, { titles: string[]; descriptions: string[] }> = {
  'Road Damage (Potholes, Cracks)': {
    titles: [
      'Large pothole causing vehicle damage',
      'Road surface severely cracked near school',
      'Multiple potholes blocking traffic flow',
      'Deep pothole causing accidents',
      'Road completely broken after heavy rain',
      'Dangerous pothole near bus stop',
      'Asphalt collapsed on main road',
      'Road surface eroded, vehicles swerving dangerously',
    ],
    descriptions: [
      'There is a large pothole approximately 50cm in diameter and 15cm deep that has been causing serious vehicle damage. Several motorcycles have already fallen due to this. Immediate repair is required as this is a heavily used route.',
      'The road surface has developed multiple cracks running across the full width of the road. After recent rainfall, the cracks have widened significantly and the road is now extremely dangerous for all vehicles, especially two-wheelers.',
      'A cluster of potholes has appeared over the past two weeks following heavy rains. Vehicles are swerving dangerously to avoid them, creating a traffic hazard. The municipality must address this urgently before a serious accident occurs.',
      'This pothole has been here for over three months and keeps getting worse. Multiple vehicles have been damaged and one cyclist fell last week. We have complained before but nothing has been done. This is unacceptable.',
    ],
  },
  'Footpath / Pavement': {
    titles: [
      'Broken pavement tiles creating trip hazard',
      'Footpath completely blocked by tree roots',
      'Missing pavement slabs near pedestrian crossing',
      'Cracked footpath dangerous for elderly residents',
      'Pavement tiles lifted and loose near school',
    ],
    descriptions: [
      'Several pavement tiles along this stretch are broken and lifted, creating a serious tripping hazard for pedestrians, especially the elderly and children. One elderly person has already fallen and injured themselves here.',
      'Tree roots have caused the footpath to buckle and break. Large sections of the pavement have been lifted completely, forcing pedestrians to walk on the road which is extremely dangerous given the heavy traffic in this area.',
      'Multiple pavement slabs are missing near the zebra crossing, leaving exposed holes. This is particularly dangerous after dark when the area is poorly lit. Children walking to school use this route daily.',
    ],
  },
  'Street Lighting': {
    titles: [
      'Street lights not working for two weeks',
      'Entire road section completely dark at night',
      'Flickering street light causing disturbance',
      'Street light pole leaning dangerously',
      'Multiple lamp posts broken in residential area',
      'No lighting near school gate after 6pm',
    ],
    descriptions: [
      'The street lights along this road have not been functioning for over two weeks. The area becomes completely dark at night making it extremely unsafe for residents and commuters. Incidents of theft have increased since the lights went out.',
      'Three consecutive street light poles are not working, leaving a 200m stretch of road in complete darkness. This is a busy pedestrian route to the bus stop. Several near-accidents have been reported. Urgent repair is needed.',
      'The street light outside our house has been flickering continuously every night for the past week. This is causing sleep disturbance for residents and the flickering may indicate a wiring fault that could cause a fire.',
      'A street light pole is visibly leaning at an angle and appears to be about to fall. It is directly above the footpath where many people walk. This is an immediate safety hazard that needs emergency attention.',
    ],
  },
  'Drainage & Flooding': {
    titles: [
      'Blocked drain causing severe flooding',
      'Drain overflow flooding residential properties',
      'Main drain collapsed causing road flooding',
      'Drainage channel completely clogged with debris',
      'Flooding after every rainfall due to blocked drain',
      'Sewage backing up into homes from blocked drain',
    ],
    descriptions: [
      'The main drain in our area has been completely blocked for several weeks. Every time it rains heavily the entire street floods to knee height, causing damage to homes and making the road impassable. Urgent clearing is required.',
      'The stormwater drain has overflowed twice this month, flooding residential properties including our ground floor. The drain appears to be blocked with construction debris from a nearby building project. Please investigate immediately.',
      'A section of the drainage canal has collapsed, causing water to back up and flood the road. The standing water has been there for 4 days and is now a health hazard attracting mosquitoes. Immediate repair is needed.',
      'The drainage channel along the road has been completely choked with silt, leaves and plastic waste. It no longer functions at all. Even light rainfall now floods the road. Mechanical clearing is urgently needed.',
    ],
  },
  'Waste Collection': {
    titles: [
      'Garbage not collected for 10 days',
      'Waste overflowing from collection point',
      'Scheduled waste collection being missed regularly',
      'Garbage bins not emptied on collection day',
      'Waste piling up on street corner',
    ],
    descriptions: [
      'The municipal garbage collection has not visited our area for 10 days. Waste is overflowing from bins and collecting on the street. The smell is terrible and it is attracting stray dogs and vermin. This is a serious health issue.',
      'The communal waste collection point at our junction has not been cleared in over a week. Garbage is spilling onto the road and footpath. Residents have been calling the hotline but no action has been taken.',
      'The scheduled Tuesday and Friday waste collection has been completely missed for the past three weeks. Residents had reduced waste for years but this failure in collection is forcing people to dump waste elsewhere.',
    ],
  },
  'Illegal Dumping': {
    titles: [
      'Illegal dumping site near canal',
      'Construction waste illegally dumped on roadside',
      'Garbage dumped next to residential area',
      'Electronic waste illegally dumped near school',
      'Illegal dumping blocking stormwater drain',
    ],
    descriptions: [
      'A large quantity of household and construction waste has been illegally dumped on the vacant land near the canal. This has been going on for months and the pile is growing. It is a fire hazard and the leachate is polluting the canal.',
      'Someone has been dumping construction debris including concrete, tiles and metal rods on the roadside verge overnight. This is blocking access and creating a hazard for vehicles. Security camera footage may be available from the adjacent house.',
      'A massive amount of garbage including plastic, food waste and hazardous materials has been dumped next to our community garden. This is destroying the environment and creating a terrible smell. The dumping appears to be from a commercial source.',
    ],
  },
  'Water Supply': {
    titles: [
      'No water supply for three days',
      'Water pressure critically low all day',
      'Burst water main flooding road',
      'Brown discoloured water from taps',
      'Water pipe leaking continuously on roadside',
      'Water supply completely cut without notice',
    ],
    descriptions: [
      'We have had no water supply for 3 consecutive days. There was no prior notice or explanation. All households in the area are affected. We cannot cook, bathe or use toilets properly. This is a public health emergency requiring immediate restoration.',
      'The water pressure in our entire street has been critically low for the past week. Water barely trickles from taps even at peak times. We have to wake up at 3am to collect enough water. The issue seems to be a main pipe problem.',
      'A water main has burst near the main junction. Water is gushing out and flooding the road. The water loss is significant and it is damaging the road surface. The burst must have been occurring for at least 12 hours based on the flooding.',
      'The water from our taps has been brown and muddy for the past four days. We cannot use it for drinking or cooking. Bought bottled water is becoming expensive. This appears to be contamination in the main supply pipe.',
    ],
  },
  'Public Property Damage': {
    titles: [
      'Park bench destroyed by vandals',
      'Public toilet facility in ruins',
      'Bus shelter roof collapsed',
      'Community notice board vandalized',
      'Public water fountain broken and leaking',
      'Playground equipment damaged and dangerous',
    ],
    descriptions: [
      'The park benches in the public park have been destroyed by vandals. Three benches are completely smashed. Elderly residents who use the park for their morning walks have nowhere to sit. This happened over the weekend.',
      'The public toilet facility near the market has been vandalized and is no longer usable. The doors have been broken, fixtures smashed and the area is now a health hazard. This facility serves the entire market community.',
      'The roof of the bus shelter at the main junction has partially collapsed, creating a dangerous situation for commuters waiting for buses. The metal roofing sheet is hanging loose and could fall on someone at any time.',
      'The playground equipment in the community park has been damaged. The slide has sharp broken edges that could injure children. The swing chain is broken. Parents are afraid to let their children use the playground.',
    ],
  },
  'Other': {
    titles: [
      'Stray dog menace in residential area',
      'Abandoned vehicle blocking road for months',
      'Noise pollution from illegal construction at night',
      'Encroachment on public land near market',
      'Road sign missing at dangerous junction',
      'Unauthorized building causing issues for neighbors',
    ],
    descriptions: [
      'There is a pack of aggressive stray dogs in our area that has been attacking residents and delivery persons. Several people have been bitten. Elderly and children are afraid to leave their homes. Immediate action from the municipal council is required.',
      'A vehicle has been abandoned on the road near our house for over two months. It is partially blocking the narrow road and creating a traffic hazard. The vehicle appears to have no number plates.',
      'Illegal construction is happening at night with heavy machinery causing extreme noise from 10pm to 3am. Residents cannot sleep. Despite complaints to the site, no action has been taken. The construction seems to be proceeding without proper permits.',
      'The road sign at the dangerous three-way junction has been missing for several weeks. Two minor accidents have already happened. Vehicles coming from the side road do not realise they must give way. Please replace this sign urgently.',
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function jitter(coord: number, range = 0.05): number {
  return coord + (Math.random() - 0.5) * range * 2
}

function generateRefNumber(index: number): string {
  return `CR-2026-${String(index).padStart(5, '0')}`
}

function generateAddress(district: string): string {
  const num = randInt(1, 350)
  const place = rand(SL_PLACE_WORDS)
  const streetType = rand(SL_STREET_TYPES)
  return `No. ${num}, ${place} ${streetType}, ${district}`
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching categories from database...')

  const categories = await prisma.category.findMany({
    include: { department: true },
  })

  if (categories.length === 0) {
    throw new Error('No categories found — run `npm run db:seed` first.')
  }

  console.log(`Found ${categories.length} categories across departments.`)

  // ── 1. Create 100 test users ──────────────────────────────────────────────
  console.log('Creating 100 test users...')
  const password = await bcrypt.hash('Test@1234', 10)

  const userRecords = []
  for (let i = 1; i <= 100; i++) {
    const first = rand(SL_FIRST_NAMES)
    const last = rand(SL_LAST_NAMES)
    const fullName = `${first} ${last}`
    const suffix = `${i}${randInt(10, 99)}`
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${suffix}@testuser.lk`
    const mobile = `+94 7${randInt(0, 8)} ${randInt(100, 999)} ${randInt(1000, 9999)}`

    userRecords.push({ fullName, email, mobile, password, isAdmin: false })
  }

  // Insert in batches to avoid overwhelming the DB
  const createdUsers: { id: string }[] = []
  for (const u of userRecords) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
      select: { id: true },
    })
    createdUsers.push(user)
  }
  console.log(`  ✓ ${createdUsers.length} users ready.`)

  // ── 2. Create 100 complaints ──────────────────────────────────────────────
  console.log('Creating 100 complaints...')

  const statuses: Status[] = ['Open', 'Open', 'Open', 'InProgress', 'InProgress', 'Resolved', 'Urgent']
  const priorities: Priority[] = ['Low', 'Medium', 'Medium', 'High']

  // Ensure every category gets at least some complaints; then fill randomly
  const categoryPool: typeof categories = []
  for (const cat of categories) {
    // Each category guaranteed at least 3 entries in the pool
    for (let n = 0; n < 3; n++) categoryPool.push(cat)
  }
  // Fill remaining slots randomly
  while (categoryPool.length < 100) {
    categoryPool.push(rand(categories))
  }
  // Shuffle
  categoryPool.sort(() => Math.random() - 0.5)

  let refIndex = (await prisma.complaint.count()) + 1

  for (let i = 0; i < 100; i++) {
    const category = categoryPool[i]
    const content = COMPLAINT_CONTENT[category.name] ?? COMPLAINT_CONTENT['Other']
    const user = createdUsers[i % createdUsers.length]
    const district = rand(SL_DISTRICTS)
    const [baseLat, baseLng] = DISTRICT_COORDS[district] ?? [7.8731, 80.7718]
    const status = rand(statuses)
    const priority = rand(priorities)

    const title = rand(content.titles)
    const description = rand(content.descriptions)

    // Build status history
    const historyEntries: { status: Status; notes: string; changedAt: Date }[] = [
      {
        status: 'Open',
        notes: 'Complaint received and logged.',
        changedAt: new Date(Date.now() - randInt(3, 30) * 24 * 60 * 60 * 1000),
      },
    ]

    if (status === 'InProgress' || status === 'Resolved') {
      historyEntries.push({
        status: 'InProgress',
        notes: 'Complaint reviewed and assigned to field team for inspection.',
        changedAt: new Date(Date.now() - randInt(1, 5) * 24 * 60 * 60 * 1000),
      })
    }
    if (status === 'Urgent') {
      historyEntries.push({
        status: 'Urgent',
        notes: 'Escalated to urgent status due to public safety risk.',
        changedAt: new Date(Date.now() - randInt(1, 3) * 24 * 60 * 60 * 1000),
      })
    }
    if (status === 'Resolved') {
      historyEntries.push({
        status: 'Resolved',
        notes: 'Work completed by field team. Issue has been resolved. Please verify and close if satisfied.',
        changedAt: new Date(Date.now() - randInt(0, 12) * 60 * 60 * 1000),
      })
    }

    const createdAt = historyEntries[0].changedAt

    await prisma.complaint.create({
      data: {
        referenceNumber: generateRefNumber(refIndex++),
        userId: user.id,
        categoryId: category.id,
        title,
        description,
        priority,
        status,
        district,
        address: generateAddress(district),
        latitude: jitter(baseLat),
        longitude: jitter(baseLng),
        createdAt,
        updatedAt: historyEntries[historyEntries.length - 1].changedAt,
        statusHistory: {
          create: historyEntries,
        },
      },
    })

    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/100 complaints created...`)
  }

  console.log('  ✓ 100 complaints created.')
  console.log('')
  console.log('Done! Test data summary:')
  console.log('  Users password:     Test@1234')
  console.log('  Admin password:     Admin@1234')
  console.log('')
  console.log('Sample dept admin logins:')
  console.log('  water.board.admin@lankafix.lk          → Water Board')
  console.log('  roads...highways.admin@lankafix.lk     → Roads & Highways')
  console.log('  electrical.department.admin@lankafix.lk → Electrical')
  console.log('  (run `npm run db:seed` to see all dept admin emails)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
