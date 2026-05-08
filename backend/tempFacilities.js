const prisma = require('./src/lib/prisma');

async function main() {
    await prisma.facilities.createMany({
  data: [
    {
      name: 'Parking',
      icon: '🚗',
      description: 'Parking available',
      is_default: true,
    },
    {
      name: 'Pharmacy',
      icon: '💊',
      description: 'In-house pharmacy',
      is_default: true,
    },
    {
      name: 'Laboratory',
      icon: '🔬',
      description: 'Diagnostic laboratory services',
      is_default: true,
    },
    {
      name: 'Emergency',
      icon: '🚨',
      description: '24/7 emergency services',
      is_default: true,
    },
    {
      name: 'Ambulance',
      icon: '🚑',
      description: 'Ambulance support available',
      is_default: true,
    },
    {
      name: 'ICU',
      icon: '❤️',
      description: 'Intensive Care Unit',
      is_default: true,
    },
    {
      name: 'OT',
      icon: '🏥',
      description: 'Operation Theatre available',
      is_default: true,
    },
    {
      name: 'Cafeteria',
      icon: '🍽',
      description: 'Food and cafeteria services',
      is_default: true,
    },
    {
      name: 'Wheelchair',
      icon: '♿',
      description: 'Wheelchair accessibility',
      is_default: true,
    },
    {
      name: 'WiFi',
      icon: '📶',
      description: 'Free WiFi available',
      is_default: true,
    },
    {
      name: 'AC Rooms',
      icon: '❄️',
      description: 'Air-conditioned rooms',
      is_default: true,
    },
    {
      name: 'X-Ray',
      icon: '📡',
      description: 'X-Ray imaging services',
      is_default: true,
    },
    {
      name: 'Ultrasound',
      icon: '🔊',
      description: 'Ultrasound scanning facility',
      is_default: true,
    },
    {
      name: 'ECG',
      icon: '📊',
      description: 'ECG diagnostic services',
      is_default: true,
    },
    {
      name: 'Blood Bank',
      icon: '🩸',
      description: 'Blood bank facility available',
      is_default: true,
    },
  ],
  skipDuplicates: true,
});
  
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });