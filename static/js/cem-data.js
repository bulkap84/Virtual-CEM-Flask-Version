// static/js/cem-data.js

const DEALERS = [
    { id: '1719', name: 'Keeler Honda', vitallyUuid: '336ab112-d93d-4b5a-a718-30023fe5eae9' },
    { id: '3883', name: 'Garber Ford', vitallyUuid: '718627ad-3383-4aff-9f59-dc6e6d8fc40a' },
    { id: '3974', name: 'Mohawk Honda', vitallyUuid: '6c1a0a58-1b00-47ba-9df7-c477147091ae' },
    { id: '3997', name: 'Luther Miller Hill Subaru', vitallyUuid: 'b69fca1e-d31f-4e8f-a543-0cc95e11b7aa' },
    { id: '3982', name: 'DeFOUW Chevrolet', vitallyUuid: 'cd0a5863-164f-44b5-a8c9-f16c88ca24e4' },
    { id: '3987', name: 'Lexus of Roseville', vitallyUuid: '1a111469-339a-494f-abc1-8c72251088a2' },
    { id: '4018', name: 'Audi Seattle', vitallyUuid: '26965386-fb4c-481b-8410-b7f3c26d1f19' },
    { id: '3996', name: 'Middletown Volkswagen', vitallyUuid: 'ecf6f049-4c64-4aa0-93b7-f4ea718ef32f' },
    { id: '3971', name: 'Honda of Downtown Los Angeles', vitallyUuid: 'a7bd4679-6a9b-4c70-93a5-1cae094ce4c3' },
    { id: '3904', name: 'Jaguar Land Rover Lakeside', vitallyUuid: '6bc56a0c-37bf-4c01-957e-c7de77cf777d' },
    { id: '2461', name: 'Braman Honda', vitallyUuid: '191d8613-8e4f-496e-aa88-9bb502bfd2d7' },
    { id: '1191', name: 'Braman Honda of Palm Beach', vitallyUuid: '8eb738d2-2367-485c-a49a-85e6643a6dc1' }
];

const MOCK_CEMS = [
    {
        dealerId: '1719', // Keeler Honda
        name: 'Chris Peck',
        email: 'chris.peck@mykaarma.com',
        photoUrl: '/static/img/Chris_Peck.png',
        calendarLink: 'https://calendly.com/chris-peck-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '3883', // Garber Ford
        name: 'Devon Supper',
        email: 'devon.supper@mykaarma.com',
        photoUrl: '/static/img/Devon_Supper.png',
        calendarLink: 'https://calendly.com/devon-supper-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '3974', // Mohawk Honda
        name: 'Chris Peck',
        email: 'chris.peck@mykaarma.com',
        photoUrl: '/static/img/Chris_Peck.png',
        calendarLink: 'https://calendly.com/chris-peck-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '3997', // Luther Miller Hill Subaru
        name: 'Shon Lucas',
        email: 'shon.lucas@mykaarma.com',
        photoUrl: '/static/img/Shon_Lucas.png',
        calendarLink: 'https://calendly.com/shon-lucas',
        isOutOfOffice: false,
    },
    {
        dealerId: '3982', // DeFOUW Chevrolet
        name: 'David Smith',
        email: 'david.smith@mykaarma.com',
        photoUrl: '/static/img/David_Smith.png',
        calendarLink: 'https://calendly.com/david-smith-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '3987', // Lexus of Roseville
        name: 'Mark Degeorge',
        email: 'mark.degeorge@mykaarma.com',
        photoUrl: '/static/img/Mark_DeGeorge.png',
        calendarLink: 'https://calendly.com/mark-degeorge-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '4018', // Audi Seattle
        name: 'Denise Farrar',
        email: 'denise.farrar@mykaarma.com',
        photoUrl: '/static/img/Denise_Farrar.png',
        calendarLink: 'https://calendly.com/denisefarrar',
        isOutOfOffice: false,
    },
    {
        dealerId: '3996', // Middletown Volkswagen
        name: 'Devon Supper',
        email: 'devon.supper@mykaarma.com',
        photoUrl: '/static/img/Devon_Supper.png',
        calendarLink: 'https://calendly.com/devon-supper-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '3971', // Honda of Downtown Los Angeles
        name: 'Blaine Schultz',
        email: 'blaine.schultz@mykaarma.com',
        photoUrl: '/static/img/Blaine_Schultz.png',
        calendarLink: 'https://calendly.com/blaine-schultz',
        isOutOfOffice: false,
    },
    {
        dealerId: '3904', // Jaguar Land Rover Lakeside
        name: 'Devon Supper',
        email: 'devon.supper@mykaarma.com',
        photoUrl: '/static/img/Devon_Supper.png',
        calendarLink: 'https://calendly.com/devon-supper-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '2461', // Braman Honda
        name: 'Devon Supper',
        email: 'devon.supper@mykaarma.com',
        photoUrl: '/static/img/Devon_Supper.png',
        calendarLink: 'https://calendly.com/devon-supper-mykaarma',
        isOutOfOffice: false,
    },
    {
        dealerId: '1191', // Braman Honda of Palm Beach
        name: 'Devon Supper',
        email: 'devon.supper@mykaarma.com',
        photoUrl: '/static/img/Devon_Supper.png',
        calendarLink: 'https://calendly.com/devon-supper-mykaarma',
        isOutOfOffice: false,
    }
];

const getCEMForDealer = (dealerId) => {
    // Try to find specific CEM
    const cem = MOCK_CEMS.find(c => c.dealerId === dealerId);
    if (cem) return cem;

    // Default fallback to Doug MacGlashan for unmapped stores
    return {
        dealerId: dealerId,
        name: 'Doug MacGlashan',
        email: 'doug.macglashan@mykaarma.com',
        photoUrl: '/static/img/Doug_MacGlashan.png',
        calendarLink: 'https://calendly.com/doug-macglashan',
        isOutOfOffice: false,
    };
};

const getDealerByName = (text) => {
    if (!text) return undefined;
    const lowerText = text.toLowerCase();

    // 1. Try to find the dealer name in its entirety first (most accurate)
    const sortedDealers = [...DEALERS].sort((a, b) => b.name.length - a.name.length);
    const fullMatch = sortedDealers.find(d => lowerText.includes(d.name.toLowerCase()));
    if (fullMatch) return fullMatch;

    // 2. Try matching by unique keywords
    const genericWords = ['honda', 'ford', 'subaru', 'chevrolet', 'lexus', 'audi', 'volkswagen', 'jaguar', 'bmw', 'mercedes', 'toyota', 'kia', 'mazda', 'dodge', 'jeep', 'ram', 'nissan', 'cadillac', 'buick', 'gmc', 'porsche', 'ferrari'];

    const words = lowerText.split(/\W+/);
    for (const d of DEALERS) {
        const dWords = d.name.toLowerCase().split(/\W+/);
        const uniqueBrand = dWords[0];

        if (!genericWords.includes(uniqueBrand) && words.includes(uniqueBrand)) {
            return d;
        }
    }

    return undefined;
};

// Export for global use in vanilla JS environment
window.CEMData = {
    DEALERS,
    MOCK_CEMS,
    getCEMForDealer,
    getDealerByName
};
