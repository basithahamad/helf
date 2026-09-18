// Drives the Site Content form. Wording only — layout and styling stay fixed.
import { CATEGORIES } from '../../lib/categories';

export { CATEGORIES };

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
    { k: 'commentaryHeading', label: 'Commentary heading' },
    { k: 'eventsHeading', label: 'Events panel heading' }] },

  { key: 'footer', title: 'Footer', fields: [
    { k: 'blurb', label: 'Footer blurb', type: 'textarea', full: true },
    { k: 'parentLinkLabel', label: 'Parent-site link label' },
    { k: 'parentLinkUrl', label: 'Parent-site URL' },
    { k: 'copyright', label: 'Copyright line', full: true }] },

  { key: 'legal', title: 'Privacy & Terms', hint: 'The two pages linked at the foot of every page', fields: [
    { k: 'privacyHeading', label: 'Privacy page heading' },
    { k: 'termsHeading', label: 'Terms page heading' },
    { k: 'privacy', label: 'Privacy policy — leave blank to use the standard wording', type: 'textarea', full: true },
    { k: 'terms', label: 'Terms of use — leave blank to use the standard wording', type: 'textarea', full: true }] }
];

// Repeatable blocks. Each is a list of rows edited with the same row editor.
export const LISTS = [
  {
    key: 'commentary',
    title: 'Commentary & Voices',
    hint: 'Pull-quote cards near the foot of the home page',
    addLabel: 'Add Card',
    cols: [['quote', 'Quote', 'textarea'], ['name', 'Name'],
           ['title', 'Title / institution'], ['image', 'Photo', 'image']]
  },
  {
    key: 'events',
    title: 'Upcoming Events',
    hint: 'The sidebar list on the home page. Leave the link blank and the event is plain text.',
    addLabel: 'Add Event',
    cols: [['day', 'Day — e.g. 15'], ['month', 'Month — e.g. May'],
           ['title', 'Event name'], ['meta', 'Location or note'], ['url', 'Link (optional)']]
  }
];
