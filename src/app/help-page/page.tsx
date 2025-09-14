import HelpHeader from '../../components/help/help-header';
import HelpCategoryCards from '../../components/help/help-category-cards';
import HelpTopicsTabs from '@/components/help/help-topics-taps';
import ContactSupport from '@/components/help/contact-support';
import CommunityResources from '@/components/help/community-resources';
export default function HelpPage() {
  return (
    <>
      <HelpHeader />
      <HelpCategoryCards />
      <HelpTopicsTabs />
      <ContactSupport />
      <CommunityResources />
    </>
  );
}
