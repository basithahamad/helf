// Drives the Site Content form. Every label on the public site appears here, so
// the wording can be changed without a deploy. Layout and styling stay fixed.

export const SITE_SCHEMA = [
  { key: 'seo', title: 'Search Engines & Browser Tab', hint: 'What Google and the browser tab show', fields: [
    { k: 'title', label: 'Site title', full: true },
    { k: 'description', label: 'Site description', type: 'textarea', full: true },
    { k: 'siteName', label: 'Name used when the site is shared' },
    { k: 'ogImage', label: 'Sharing image — shown on social media and chat previews', type: 'image', full: true }] },

  { key: 'brand', title: 'Masthead', hint: 'The header at the top of every page', fields: [
    { k: 'name', label: 'Publication name — first part' },
    { k: 'nameEm', label: 'Publication name — italic part' },
    { k: 'tagline', label: 'Tagline under the name', full: true },
    { k: 'logo', label: 'Logo', type: 'image', full: true },
    { k: 'logoAlt', label: 'Logo description for screen readers', full: true },
    { k: 'subscribeLabel', label: 'Subscribe button label' },
    { k: 'searchPlaceholder', label: 'Search box placeholder' },
    { k: 'homeLabel', label: 'First nav item label' },
    { k: 'utilityDate', label: 'Text on the far left of the top bar' }] },

  { key: 'utility', title: 'Top Bar Links', hint: 'The thin bar above the masthead', fields: [
    { k: 'mainSiteLabel', label: 'Main-site link label' },
    { k: 'mainSiteUrl', label: 'Main-site URL' },
    { k: 'aboutLabel', label: 'About link label' },
    { k: 'newsletterLabel', label: 'Newsletter link label' }] },

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
    { k: 'bio', label: 'Welcome text — leave a blank line between paragraphs', type: 'textarea', full: true },
    { k: 'fullBioLabel', label: 'Full-bio link label' },
    { k: 'fullBioUrl', label: 'Full-bio link URL' }] },

  { key: 'sections', title: 'Headings & Labels', hint: 'Wording used across the home page and listings', fields: [
    { k: 'featuredLabel', label: 'Featured ticker label' },
    { k: 'featuredReadMore', label: 'Featured ticker link text' },
    { k: 'latestHeading', label: 'Latest news heading' },
    { k: 'viewAllLabel', label: 'Latest news “view all” link' },
    { k: 'eventsHeading', label: 'Events panel heading' },
    { k: 'commentaryHeading', label: 'Commentary heading' },
    { k: 'allCommentaryLabel', label: 'Commentary “view all” link' },
    { k: 'allCommentarySlug', label: 'Category that link opens (slug)' },
    { k: 'allStoriesHeading', label: 'All-stories page heading' },
    { k: 'moreFromHeading', label: 'Heading under an article' },
    { k: 'searchHeading', label: 'Search page heading' },
    { k: 'subscribeHeading', label: 'Newsletter heading', full: true },
    { k: 'subscribeBlurb', label: 'Newsletter blurb', type: 'textarea', full: true },
    { k: 'subscribeImage', label: 'Newsletter band photograph', type: 'image', full: true },
    { k: 'emptyMessage', label: 'Shown when there are no articles', full: true },
    { k: 'emptyCategoryMessage', label: 'Empty category — {category} is replaced by its name', full: true },
    { k: 'searchPromptMessage', label: 'Shown on the search page before searching', full: true },
    { k: 'searchEmptyMessage', label: 'No search results — {query} is replaced by the search', full: true }] },

  { key: 'footer', title: 'Footer', fields: [
    { k: 'orgName', label: 'Organisation line under the logo', full: true },
    { k: 'blurb', label: 'Footer blurb', type: 'textarea', full: true },
    { k: 'sectionsHeading', label: 'First column heading' },
    { k: 'allStoriesLabel', label: 'All-stories link label' },
    { k: 'aboutHeading', label: 'Second column heading' },
    { k: 'parentLinkLabel', label: 'Parent-site link label' },
    { k: 'parentLinkUrl', label: 'Parent-site URL' },
    { k: 'aboutReviewLabel', label: 'About-the-Review link label' },
    { k: 'newsletterLabel', label: 'Newsletter link label' },
    { k: 'copyright', label: 'Copyright line', full: true },
    { k: 'privacyLabel', label: 'Privacy link label' },
    { k: 'termsLabel', label: 'Terms link label' }] },

  { key: 'legal', title: 'Privacy & Terms', hint: 'The two pages linked at the foot of every page', fields: [
    { k: 'privacyHeading', label: 'Privacy page heading' },
    { k: 'termsHeading', label: 'Terms page heading' },
    { k: 'privacy', label: 'Privacy policy — blank lines separate paragraphs', type: 'textarea', full: true },
    { k: 'terms', label: 'Terms of use — blank lines separate paragraphs', type: 'textarea', full: true }] }
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
