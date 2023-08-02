import { ReactElement } from "react";

import { NextPageWithLayout } from "@declarations";

import { MainLayout } from "@layouts";

import { Home } from "@pages";

const Page: NextPageWithLayout = () => <Home />;

Page.getLayout = (page: ReactElement) => <MainLayout>{page}</MainLayout>;

export default Page;
