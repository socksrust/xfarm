import { useEffect } from "react";
import useMangoStore from "../../stores/useMangoStore";
import { connectionSelector, mangoGroupSelector } from "../../stores/selectors";
import { PublicKey } from "@solana/web3.js";
import {
  ReferrerIdRecordLayout,
  ReferrerIdRecord,
} from "@blockworks-foundation/mango-client";
import { useRouter } from "next/router";

const FetchReferrer = () => {
  const setMangoStore = useMangoStore((s) => s.set);
  const router = useRouter();
  const mangoGroup = useMangoStore(mangoGroupSelector);
  const connection = useMangoStore(connectionSelector);
  const { query } = router;

  useEffect(() => {
    const storeReferrer = async () => {
      if (query.ref && mangoGroup) {
        let referrerPk;
        if (query.ref.length === 44) {
          referrerPk = new PublicKey(query.ref);
        } else {
          let decodedRefLink: string | null = null;
          try {
            decodedRefLink = decodeURIComponent(query.ref as string);
          } catch (e) {
            console.log("Failed to decode referrer link", e);
          }
          const mangoClient = useMangoStore.getState().connection.client;
          if (!decodedRefLink) return;

          const { referrerPda } = await mangoClient.getReferrerPda(
            mangoGroup,
            decodedRefLink
          );
          const info = await connection.getAccountInfo(referrerPda);
          if (info) {
            const decoded = ReferrerIdRecordLayout.decode(info.data);
            const referrerRecord = new ReferrerIdRecord(decoded);
            referrerPk = referrerRecord.referrerMangoAccount;
          }
        }
        setMangoStore((state) => {
          state.referrerPk = referrerPk;
        });
      }
    };

    storeReferrer();
  }, [query, mangoGroup]);

  return null;
};

export default FetchReferrer;
