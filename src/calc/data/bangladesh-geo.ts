// src/data/bangladesh-geo.ts

export interface Upazila {
  readonly id: string;
  readonly nameBn: string;
}

export interface District {
  readonly id: string;
  readonly nameBn: string;
  readonly upazilas: readonly Upazila[];
}

export interface Division {
  readonly id: string;
  readonly nameBn: string;
  readonly districts: readonly District[];
}

export const BANGLADESH_GEO: readonly Division[] = [
  {
    id: 'rangpur',
    nameBn: 'রংপুর',
    districts: [
      {
        id: 'kurigram',
        nameBn: 'কুড়িগ্রাম',
        upazilas: [
          { id: 'kurigram-sadar', nameBn: 'কুড়িগ্রাম সদর' },
          { id: 'ulipur', nameBn: 'উলিপুর' },
          { id: 'phulbari', nameBn: 'ফুলবাড়ী' },
          { id: 'bhurungamari', nameBn: 'ভূরুঙ্গামারী' },
          { id: 'nageshwari', nameBn: 'নাগেশ্বরী' },
          { id: 'chilmari', nameBn: 'চিলমারী' },
          { id: 'raomari', nameBn: 'রৌমারী' },
          { id: 'rajarhat', nameBn: 'রাজারহাট' },
          { id: 'char-rajibpur', nameBn: 'রাজিবপুর' },
        ],
      },
      {
        id: 'gaibandha',
        nameBn: 'গাইবান্ধা',
        upazilas: [
          { id: 'gaibandha-sadar', nameBn: 'গাইবান্ধা সদর' },
          { id: 'gobindaganj', nameBn: 'গোবিন্দগঞ্জ' },
          { id: 'sundarganj', nameBn: 'সুন্দরগঞ্জ' },
          { id: 'sadullapur', nameBn: 'সাদুল্লাপুর' },
          { id: 'palashbari', nameBn: 'পলাশবাড়ী' },
        ],
      },
      {
        id: 'dinajpur',
        nameBn: 'দিনাজপুর',
        upazilas: [
          { id: 'dinajpur-sadar', nameBn: 'দিনাজপুর সদর' },
          { id: 'birganj', nameBn: 'বীরগঞ্জ' },
          { id: 'parbatipur', nameBn: 'পার্বতীপুর' },
          { id: 'fulbari-dinajpur', nameBn: 'ফুলবাড়ী' },
        ],
      },
      {
        id: 'thakurgaon',
        nameBn: 'ঠাকুরগাঁও',
        upazilas: [
          { id: 'thakurgaon-sadar', nameBn: 'ঠাকুরগাঁও সদর' },
          { id: 'pirganj-thakurgaon', nameBn: 'পীরগঞ্জ' },
          { id: 'ranisankail', nameBn: 'রাণীশংকৈল' },
        ],
      },
      {
        id: 'panchagarh',
        nameBn: 'পঞ্চগড়',
        upazilas: [
          { id: 'panchagarh-sadar', nameBn: 'পঞ্চগড় সদর' },
          { id: 'tetulia', nameBn: 'তেঁতুলিয়া' },
          { id: 'boda', nameBn: 'বোদা' },
        ],
      },
      {
        id: 'nilphamari',
        nameBn: 'নীলফামারী',
        upazilas: [
          { id: 'nilphamari-sadar', nameBn: 'নীলফামারী সদর' },
          { id: 'saidpur', nameBn: 'সৈয়দপুর' },
          { id: 'domar', nameBn: 'ডোমার' },
          { id: 'dimla', nameBn: 'ডিমলা' },
        ],
      },
      {
        id: 'lalmonirhat',
        nameBn: 'লালমনিরহাট',
        upazilas: [
          { id: 'lalmonirhat-sadar', nameBn: 'লালমনিরহাট সদর' },
          { id: 'patgram', nameBn: 'পাটগ্রাম' },
          { id: 'hatibandha', nameBn: 'হাতীবান্ধা' },
        ],
      },
      {
        id: 'rangpur-district',
        nameBn: 'রংপুর',
        upazilas: [
          { id: 'rangpur-sadar', nameBn: 'রংপুর সদর' },
          { id: 'badarganj', nameBn: 'বদরগঞ্জ' },
          { id: 'pirgachha', nameBn: 'পীরগাছা' },
          { id: 'mithapukur', nameBn: 'মিঠাপুকুর' },
        ],
      },
    ],
  },
  {
    id: 'dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        id: 'dhaka-district',
        nameBn: 'ঢাকা',
        upazilas: [
          { id: 'savar', nameBn: 'সাভার' },
          { id: 'dhamrai', nameBn: 'ধামরাই' },
          { id: 'keraniganj', nameBn: 'কেরানীগঞ্জ' },
          { id: 'nawabganj', nameBn: 'নবাবগঞ্জ' },
          { id: 'dohar', nameBn: 'দোহার' },
        ],
      },
      {
        id: 'gazipur',
        nameBn: 'গাজীপুর',
        upazilas: [
          { id: 'gazipur-sadar', nameBn: 'গাজীপুর সদর' },
          { id: 'kaliakair', nameBn: 'কালিয়াকৈর' },
          { id: 'kapasia', nameBn: 'কাপাসিয়া' },
          { id: 'sreepur', nameBn: 'শ্রীপুর' },
        ],
      },
      {
        id: 'narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        upazilas: [
          { id: 'narayanganj-sadar', nameBn: 'নারায়ণগঞ্জ সদর' },
          { id: 'bandar', nameBn: 'বন্দর' },
          { id: 'rupganj', nameBn: 'রূপগঞ্জ' },
          { id: 'sonargaon', nameBn: 'সোনারগাঁও' },
        ],
      },
      {
        id: 'tangail',
        nameBn: 'টাঙ্গাইল',
        upazilas: [
          { id: 'tangail-sadar', nameBn: 'টাঙ্গাইল সদর' },
          { id: 'ghatail', nameBn: 'ঘাটাইল' },
          { id: 'mirzapur', nameBn: 'মির্জাপুর' },
          { id: 'madhupur', nameBn: 'মধুপুর' },
        ],
      },
      {
        id: 'kishoreganj',
        nameBn: 'কিশোরগঞ্জ',
        upazilas: [
          { id: 'kishoreganj-sadar', nameBn: 'কিশোরগঞ্জ সদর' },
          { id: 'bhairab', nameBn: 'ভৈরব' },
          { id: 'bajitpur', nameBn: 'বাজিতপুর' },
        ],
      },
      {
        id: 'manikganj',
        nameBn: 'মানিকগঞ্জ',
        upazilas: [
          { id: 'manikganj-sadar', nameBn: 'মানিকগঞ্জ সদর' },
          { id: 'singair', nameBn: 'সিংগাইর' },
          { id: 'shibalaya', nameBn: 'শিবালয়' },
        ],
      },
      {
        id: 'munshiganj',
        nameBn: 'মুন্সিগঞ্জ',
        upazilas: [
          { id: 'munshiganj-sadar', nameBn: 'মুন্সিগঞ্জ সদর' },
          { id: 'sreenagar', nameBn: 'শ্রীনগর' },
          { id: 'lohajang', nameBn: 'লৌহজং' },
        ],
      },
      {
        id: 'narsingdi',
        nameBn: 'নরসিংদী',
        upazilas: [
          { id: 'narsingdi-sadar', nameBn: 'নরসিংদী সদর' },
          { id: 'shibpur', nameBn: 'শিবপুর' },
          { id: 'raipura', nameBn: 'রায়পুরা' },
        ],
      },
    ],
  },
  {
    id: 'chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      {
        id: 'chattogram-district',
        nameBn: 'চট্টগ্রাম',
        upazilas: [
          { id: 'hathazari', nameBn: 'হাটহাজারী' },
          { id: 'patiya', nameBn: 'পটিয়া' },
          { id: 'sitakunda', nameBn: 'সীতাকুণ্ড' },
          { id: 'mirsharai', nameBn: 'মীরসরাই' },
        ],
      },
      {
        id: 'coxsbazar',
        nameBn: 'কক্সবাজার',
        upazilas: [
          { id: 'coxsbazar-sadar', nameBn: 'কক্সবাজার সদর' },
          { id: 'ramu', nameBn: 'রামু' },
          { id: 'teknaf', nameBn: 'টেকনাফ' },
          { id: 'chakaria', nameBn: 'চকোরিয়া' },
        ],
      },
      {
        id: 'cumilla',
        nameBn: 'কুমিল্লা',
        upazilas: [
          { id: 'cumilla-adarsha-sadar', nameBn: 'কুমিল্লা আদর্শ সদর' },
          { id: 'chandina', nameBn: 'চান্দিনা' },
          { id: 'daudkandi', nameBn: 'দাউদকান্দি' },
        ],
      },
      {
        id: 'brahmanbaria',
        nameBn: 'ব্রাহ্মণবাড়িয়া',
        upazilas: [
          { id: 'brahmanbaria-sadar', nameBn: 'ব্রাহ্মণবাড়িয়া সদর' },
          { id: 'ashuganj', nameBn: 'আশুগঞ্জ' },
          { id: 'kasba', nameBn: 'কসবা' },
        ],
      },
      {
        id: 'chandpur',
        nameBn: 'চাঁদপুর',
        upazilas: [
          { id: 'chandpur-sadar', nameBn: 'চাঁদপুর সদর' },
          { id: 'hajiganj', nameBn: 'হাজীগঞ্জ' },
          { id: 'matlab-dakshin', nameBn: 'মতলব দক্ষিণ' },
        ],
      },
      {
        id: 'feni',
        nameBn: 'ফেনী',
        upazilas: [
          { id: 'feni-sadar', nameBn: 'ফেনী সদর' },
          { id: 'daganbhuiyan', nameBn: 'দাগনভূঞা' },
          { id: 'parshuram', nameBn: 'পরশুরাম' },
        ],
      },
      {
        id: 'lakshmipur',
        nameBn: 'লক্ষ্মীপুর',
        upazilas: [
          { id: 'lakshmipur-sadar', nameBn: 'লক্ষ্মীপুর সদর' },
          { id: 'raipur', nameBn: 'রায়পুর' },
          { id: 'ramganj', nameBn: 'রামগঞ্জ' },
        ],
      },
      {
        id: 'noakhali',
        nameBn: 'নোয়াখালী',
        upazilas: [
          { id: 'noakhali-sadar', nameBn: 'নোয়াখালী সদর' },
          { id: 'begumganj', nameBn: 'বেগমগঞ্জ' },
          { id: 'chatkhil', nameBn: 'চাটখিল' },
        ],
      },
      {
        id: 'bandarban',
        nameBn: 'বান্দরবান',
        upazilas: [
          { id: 'bandarban-sadar', nameBn: 'বান্দরবান সদর' },
          { id: 'rowangchhari', nameBn: 'রোয়াংছড়ি' },
          { id: 'ruma', nameBn: 'রুমা' },
        ],
      },
      {
        id: 'rangamati',
        nameBn: 'রাঙ্গামাটি',
        upazilas: [
          { id: 'rangamati-sadar', nameBn: 'রাঙ্গামাটি সদর' },
          { id: 'kaptai', nameBn: 'কাপ্তাই' },
          { id: 'baghaichhari', nameBn: 'বাঘাইছড়ি' },
        ],
      },
      {
        id: 'khagrachhari',
        nameBn: 'খাগড়াছড়ি',
        upazilas: [
          { id: 'khagrachhari-sadar', nameBn: 'খাগড়াছড়ি সদর' },
          { id: 'dighinala', nameBn: 'দীঘিনালা' },
          { id: 'panchhari', nameBn: 'পানছড়ি' },
        ],
      },
    ],
  },
  {
    id: 'rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      {
        id: 'rajshahi-district',
        nameBn: 'রাজশাহী',
        upazilas: [
          { id: 'paba', nameBn: 'পবা' },
          { id: 'godagari', nameBn: 'গোদাগাড়ী' },
          { id: 'tanore', nameBn: 'তানোর' },
          { id: 'bagmara', nameBn: 'বাগমারা' },
        ],
      },
      {
        id: 'natore',
        nameBn: 'নাটোর',
        upazilas: [
          { id: 'natore-sadar', nameBn: 'নাটোর সদর' },
          { id: 'singra', nameBn: 'সিংড়া' },
          { id: 'baraigram', nameBn: 'বড়াইগ্রাম' },
        ],
      },
      {
        id: 'naogaon',
        nameBn: 'নওগাঁ',
        upazilas: [
          { id: 'naogaon-sadar', nameBn: 'নওগাঁ সদর' },
          { id: 'patnitala', nameBn: 'পত্নীতলা' },
          { id: 'mohadevpur', nameBn: 'মহাদেবপুর' },
        ],
      },
      {
        id: 'chapai-nawabganj',
        nameBn: 'চাঁপাইনবাবগঞ্জ',
        upazilas: [
          { id: 'chapai-sadar', nameBn: 'চাঁপাইনবাবগঞ্জ সদর' },
          { id: 'shibganj', nameBn: 'শিবগঞ্জ' },
          { id: 'gomastapur', nameBn: 'গোমস্তাপুর' },
        ],
      },
      {
        id: 'pabna',
        nameBn: 'পাবনা',
        upazilas: [
          { id: 'pabna-sadar', nameBn: 'পাবনা সদর' },
          { id: 'ishwardi', nameBn: 'ঈশ্বরদী' },
          { id: 'beraa', nameBn: 'বেড়া' },
        ],
      },
      {
        id: 'sirajganj',
        nameBn: 'সিরাজগঞ্জ',
        upazilas: [
          { id: 'sirajganj-sadar', nameBn: 'সিরাজগঞ্জ সদর' },
          { id: 'shahjadpur', nameBn: 'শাহজাদপুর' },
          { id: 'ullapara', nameBn: 'উল্লাপাড়া' },
        ],
      },
      {
        id: 'bogura',
        nameBn: 'বগুড়া',
        upazilas: [
          { id: 'bogura-sadar', nameBn: 'বগুড়া সদর' },
          { id: 'shibganj-bogura', nameBn: 'শিবগঞ্জ' },
          { id: 'sariakandi', nameBn: 'সারিয়াকান্দি' },
        ],
      },
      {
        id: 'joypurhat',
        nameBn: 'জয়পুরহাট',
        upazilas: [
          { id: 'joypurhat-sadar', nameBn: 'জয়পুরহাট সদর' },
          { id: 'panchbibi', nameBn: 'পাঁচবিবি' },
          { id: 'kalai', nameBn: 'কালাই' },
        ],
      },
    ],
  },
  {
    id: 'khulna',
    nameBn: 'খুলনা',
    districts: [
      {
        id: 'khulna-district',
        nameBn: 'খুলনা',
        upazilas: [
          { id: 'dighalia', nameBn: 'দিঘলিয়া' },
          { id: 'dumuria', nameBn: 'ডুমুরিয়া' },
          { id: 'rupsha', nameBn: 'রূপসা' },
          { id: 'paikgachha', nameBn: 'পাইকগাছা' },
        ],
      },
      {
        id: 'bagerhat',
        nameBn: 'বাগেরহাট',
        upazilas: [
          { id: 'bagerhat-sadar', nameBn: 'বাগেরহাট সদর' },
          { id: 'mongla', nameBn: 'মোংলা' },
          { id: 'morrelganj', nameBn: 'মোরেলগঞ্জ' },
        ],
      },
      {
        id: 'satkhira',
        nameBn: 'সাতক্ষীরা',
        upazilas: [
          { id: 'satkhira-sadar', nameBn: 'সাতক্ষীরা সদর' },
          { id: 'shyamnagar', nameBn: 'শ্যামনগর' },
          { id: 'kalaroa', nameBn: 'কলারোয়া' },
        ],
      },
      {
        id: 'jashore',
        nameBn: 'যশোর',
        upazilas: [
          { id: 'jashore-sadar', nameBn: 'যশোর সদর' },
          { id: 'jhikargachha', nameBn: 'ঝিকরগাছা' },
          { id: 'keshabpur', nameBn: 'কেশবপুর' },
        ],
      },
      {
        id: 'jhenaidah',
        nameBn: 'ঝিনাইদহ',
        upazilas: [
          { id: 'jhenaidah-sadar', nameBn: 'ঝিনাইদহ সদর' },
          { id: 'kaliganj-jhenaidah', nameBn: 'কালীগঞ্জ' },
          { id: 'shailkupa', nameBn: 'শৈলকুপা' },
        ],
      },
      {
        id: 'magura',
        nameBn: 'মাগুরা',
        upazilas: [
          { id: 'magura-sadar', nameBn: 'মাগুরা সদর' },
          { id: 'sreepur-magura', nameBn: 'শ্রীপুর' },
          { id: 'mohammadpur', nameBn: 'মহম্মদপুর' },
        ],
      },
      {
        id: 'narail',
        nameBn: 'নড়াইল',
        upazilas: [
          { id: 'narail-sadar', nameBn: 'নড়াইল সদর' },
          { id: 'lohagagara', nameBn: 'লোহাগড়া' },
          { id: 'kalia', nameBn: 'কালিয়া' },
        ],
      },
      {
        id: 'kushtia',
        nameBn: 'কুষ্টিয়া',
        upazilas: [
          { id: 'kushtia-sadar', nameBn: 'কুষ্টিয়া সদর' },
          { id: 'kumarkhali', nameBn: 'কুমারখালী' },
          { id: 'bheramara', nameBn: 'ভেড়ামারা' },
        ],
      },
      {
        id: 'chuadanga',
        nameBn: 'চুয়াডাঙ্গা',
        upazilas: [
          { id: 'chuadanga-sadar', nameBn: 'চুয়াডাঙ্গা সদর' },
          { id: 'alamdanga', nameBn: 'আলমডাঙ্গা' },
          { id: 'damurhuda', nameBn: 'দামুড়হুদা' },
        ],
      },
      {
        id: 'meherpur',
        nameBn: 'মেহেরপুর',
        upazilas: [
          { id: 'meherpur-sadar', nameBn: 'মেহেরপুর সদর' },
          { id: 'gangni', nameBn: 'গাংনী' },
          { id: 'mujibnagar', nameBn: 'মুজিবনগর' },
        ],
      },
    ],
  },
  {
    id: 'barishal',
    nameBn: 'বরিশাল',
    districts: [
      {
        id: 'barishal-district',
        nameBn: 'বরিশাল',
        upazilas: [
          { id: 'barishal-sadar', nameBn: 'বরিশাল সদর' },
          { id: 'bakerganj', nameBn: 'বাকেরগঞ্জ' },
          { id: 'banaripara', nameBn: 'বানারীপাড়া' },
        ],
      },
      {
        id: 'patuakhali',
        nameBn: 'পটুয়াখালী',
        upazilas: [
          { id: 'patuakhali-sadar', nameBn: 'পটুয়াখালী সদর' },
          { id: 'galachipa', nameBn: 'গলাচিপা' },
          { id: 'kalapara', nameBn: 'কলাপাড়া' },
        ],
      },
      {
        id: 'bhola',
        nameBn: 'ভোলা',
        upazilas: [
          { id: 'bhola-sadar', nameBn: 'ভোলা সদর' },
          { id: 'char-fasson', nameBn: 'চরফ্যাশন' },
          { id: 'borhanuddin', nameBn: 'বোরহানউদ্দিন' },
        ],
      },
      {
        id: 'pirojpur',
        nameBn: 'পিরোজপুর',
        upazilas: [
          { id: 'pirojpur-sadar', nameBn: 'পিরোজপুর সদর' },
          { id: 'bhandaria', nameBn: 'ভাণ্ডারিয়া' },
          { id: 'mathbaria', nameBn: 'মঠবাড়িয়া' },
        ],
      },
      {
        id: 'barguna',
        nameBn: 'বরগুনা',
        upazilas: [
          { id: 'barguna-sadar', nameBn: 'বরগুনা সদর' },
          { id: 'amtali', nameBn: 'আমতলী' },
          { id: 'patharghata', nameBn: 'পাথরঘাটা' },
        ],
      },
      {
        id: 'jhalakathi',
        nameBn: 'ঝালকাঠি',
        upazilas: [
          { id: 'jhalakathi-sadar', nameBn: 'ঝালকাঠি সদর' },
          { id: 'nalchity', nameBn: 'নলছিটি' },
          { id: 'rajapur', nameBn: 'রাজাপুর' },
        ],
      },
    ],
  },
  {
    id: 'sylhet',
    nameBn: 'সিলেট',
    districts: [
      {
        id: 'sylhet-district',
        nameBn: 'সিলেট',
        upazilas: [
          { id: 'sylhet-sadar', nameBn: 'সিলেট সদর' },
          { id: 'beanibazar', nameBn: 'বিয়ানীবাজার' },
          { id: 'golapganj', nameBn: 'গোলাপগঞ্জ' },
        ],
      },
      {
        id: 'moulvibazar',
        nameBn: 'মৌলভীবাজার',
        upazilas: [
          { id: 'moulvibazar-sadar', nameBn: 'মৌলভীবাজার সদর' },
          { id: 'sreemangal', nameBn: 'শ্রীমঙ্গল' },
          { id: 'kulaura', nameBn: 'কুলাউড়া' },
        ],
      },
      {
        id: 'habiganj',
        nameBn: 'হবিগঞ্জ',
        upazilas: [
          { id: 'habiganj-sadar', nameBn: 'হবিগঞ্জ সদর' },
          { id: 'madhabpur', nameBn: 'মাধবপুর' },
          { id: 'nabiganj', nameBn: 'নবীগঞ্জ' },
        ],
      },
      {
        id: 'sunamganj',
        nameBn: 'সুনামগঞ্জ',
        upazilas: [
          { id: 'sunamganj-sadar', nameBn: 'সুনামগঞ্জ সদর' },
          { id: 'chhatak', nameBn: 'ছাতক' },
          { id: 'tahirpur', nameBn: 'তাহিরপুর' },
        ],
      },
    ],
  },
  {
    id: 'mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      {
        id: 'mymensingh-district',
        nameBn: 'ময়মনসিংহ',
        upazilas: [
          { id: 'mymensingh-sadar', nameBn: 'ময়মনসিংহ সদর' },
          { id: 'muktagachha', nameBn: 'মুক্তাগাছা' },
          { id: 'trishal', nameBn: 'ত্রিশাল' },
          { id: 'fulbaria', nameBn: 'ফুলবাড়িয়া' },
        ],
      },
      {
        id: 'jamalpur',
        nameBn: 'জামালপুর',
        upazilas: [
          { id: 'jamalpur-sadar', nameBn: 'জামালপুর সদর' },
          { id: 'sarishabari', nameBn: 'সরিষাবাড়ী' },
          { id: 'islampur', nameBn: 'ইসলামপুর' },
        ],
      },
      {
        id: 'netrokona',
        nameBn: 'নেত্রকোণা',
        upazilas: [
          { id: 'netrokona-sadar', nameBn: 'নেত্রকোণা সদর' },
          { id: 'kendua', nameBn: 'কেন্দুয়া' },
          { id: 'durgapur-netrokona', nameBn: 'দুর্গাপুর' },
        ],
      },
      {
        id: 'sherpur',
        nameBn: 'শেরপুর',
        upazilas: [
          { id: 'sherpur-sadar', nameBn: 'শেরপুর সদর' },
          { id: 'nalitabari', nameBn: 'নালিতাবাড়ী' },
          { id: 'nakla', nameBn: 'নকলা' },
        ],
      },
    ],
  },
];

export const BANGLADESH_DIVISIONS = BANGLADESH_GEO;

export const getDistrictsByDivision = (divisionId: string): readonly District[] => {
  const div = BANGLADESH_GEO.find((d) => d.id === divisionId);
  return div?.districts ?? [];
};

export const getUpazilasByDistrict = (
  divisionId: string,
  districtId: string
): readonly Upazila[] => {
  const districts = getDistrictsByDivision(divisionId);
  const dist = districts.find((d) => d.id === districtId);
  return dist?.upazilas ?? [];
};
