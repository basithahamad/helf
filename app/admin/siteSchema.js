// Drives the Site Content form. Wording only — layout and styling stay fixed.
export const SITE_SCHEMA = [
  { key: 'brand', title: 'Masthead', hint: 'The header at the top of every page', fields: [
    { k: 'name', label: 'Publication name — first part' },
    { k: 'nameEm', label: 'Publication name — italic part' },
    { k: 'tagline', label: 'Tagline under the name', full: true },
    { k: 'subscribeLabel', label: 'Subscribe button label' },
    { k: 'searchPlaceholder', label: 'Search box placeholder' }] },

  { key: 'about', title: 'About The Review', hint: 'Sidebar panel', fields: [
    { k: 'heading', label: 'Heading', full: true },
    { k: 'text', label: 'Description', type: 'textarea', full: true },
    { k: 'parentLinkLabel', label: 'Parent-site button label' },
    { k: 'parentLinkUrl', label: 'Parent-site URL' }] },

  { key: 'editor', title: 'From the Editor', hint: 'Sidebar profile', fields: [
    { k: 'widgetHeading', label: 'Panel heading' },
    { k: 'name', label: 'Editor name' },
    { k: 'role', label: 'Role' },
    { k: 'image', label: 'Headshot', type: 'image', full: true },
    { k: 'bio', label: 'Short bio', type: 'textarea', full: true },
    { k: 'fullBioLabel', label: 'Full-bio link label' },
    { k: 'fullBioUrl', label: 'Full-bio link URL' }] },

  { key: 'sections', title: 'Section Headings', fields: [
    { k: 'latestHeading', label: 'Latest news heading' },
    { k: 'commentaryHeading', label: 'Commentary heading' }] },

  { key: 'footer', title: 'Footer', fields: [
    { k: 'blurb', label: 'Footer blurb', type: 'textarea', full: true },
    { k: 'parentLinkLabel', label: 'Parent-site link label' },
    { k: 'parentLinkUrl', label: 'Parent-site URL' },
    { k: 'copyright', label: 'Copyright line', full: true }] }
];

// Commentary cards are a list rather than fixed fields.
export const COMMENTARY = {
  key: 'commentary',
  title: 'Commentary & Voices',
  hint: 'Pull-quote cards near the foot of the home page',
  cols: [['quote', 'Quote', 'textarea'], ['name', 'Name'], ['title', 'Title / institution'], ['image', 'Photo', 'image']]
};

export const CATEGORIES = [
  'Featured Stories', 'Latest News', 'Leadership', 'HBCU Spotlight', 'Events',
  'Announcements', 'Commentary', 'Research & Policy', 'Alumni Voices'
];
