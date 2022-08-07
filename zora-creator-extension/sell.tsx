import { FC, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { DatePicker, Goods } from "@/components";
import { NFT } from "../../collection/interface";
import Loading from "@/components/loading";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
} from "antd";
import dayjs from "dayjs";
import useSWR from "swr";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, constants, utils, Contract } from "ethers";
import { getOrderHash } from "@/utils";
import Link from "next/link";
import DetailAsset from "@/components/goods/DetailAsset";
import { useContractWrite } from "wagmi";
import Ask from "./Ask.json";
import ERC721Tradable from "./ERC721Tradable.json";

const { RangePicker } = DatePicker;

const NFTSell: FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { account, provider } = useWeb3React();
  const [form] = Form.useForm();

  // const [data, setData] = useState<NFT>();
  const { data } = useSWR<NFT>(() => `/api/v1/portal/nft/${id}`);
  const { data: payments } = useSWR("/api/v1/cv/payment/rate");
  console.log(payments);
  // const loadData = useCallback(async () => {
  //   const nftRes = await axios.get(`/api/v1/portal/nft/${id}`);
  //   if (nftRes.data) {
  //     setData(nftRes.data);
  //   }
  // }, [id]);

  // useEffect(() => {
  //   loadData();
  // }, [loadData]);

  interface createAskCall {
    tokenContract: any;
    tokenId: any;
    askPrice: any;
    askCurrency: any;
    sellerFundsRecipient: any;
    findersFeeBps: any;
  }

  const [createAsk, setCreateAsk] = useState<createAskCall>({
    tokenContract: "0x5f82E01A1c18EfCfae6C5F91c78D6633E9035827",
    tokenId: "313",
    askPrice: "",
    askCurrency: "0x0000000000000000000000000000000000000000",
    sellerFundsRecipient: account,
    findersFeeBps: 250,
  });

  const chainAskAddress: Record<string, string> = {
    1: "0x6170B3C3A54C3d8c854934cBC314eD479b2B29A3",
    4: "0xA98D3729265C88c5b3f861a0c501622750fF4806",
    3: "0x3e80102228295fFD120990d54e954C473EDE7280",
    137: "0x3634e984Ba0373Cfa178986FD19F03ba4dD8E469",
    80001: "0xCe6cEf2A9028e1C3B21647ae3B4251038109f42a",
  };

  const chainHelperAddress: Record<string, string> = {
    1: "0x909e9efE4D87d1a6018C2065aE642b6D0447bc91",
    4: "0x029AA5a949C9C90916729D50537062cb73b5Ac92",
    3: "0x0afB6A47C303f85c5A6e0DC6c9b4c2001E6987ED",
    137: "0xCe6cEf2A9028e1C3B21647ae3B4251038109f42a",
    80001: "0x909e9efE4D87d1a6018C2065aE642b6D0447bc91",
  };

  const chainModuleAddress: Record<string, string> = {
    1: "0x850A7c6fE2CF48eea1393554C8A3bA23f20CC401",
    4: "0xa248736d3b73A231D95A5F99965857ebbBD42D85",
    3: "0x3120f8A161bf8ae8C4287A66920E7Fd875b41805",
    137: "0xCCA379FDF4Beda63c4bB0e2A3179Ae62c8716794",
    80001: "0x850A7c6fE2CF48eea1393554C8A3bA23f20CC401",
  };

  const chainFeeAddress: Record<string, string> = {
    1: "0x9641169A1374b77E052E1001c5a096C29Cd67d35",
    4: "0x8Ecd14bd28bf992B6d0595B3E35d5C206e2e2dbb",
    3: "0x5312484b5b23Cb01A52DC22111BbcF7Ebb198328",
    137: "0xCCA379FDF4Beda63c4bB0e2A3179Ae62c8716794",
    80001: "0x9641169A1374b77E052E1001c5a096C29Cd67d35",
  };

  const chain20helperAddress: Record<string, string> = {
    1: "0xCCA379FDF4Beda63c4bB0e2A3179Ae62c8716794",
    4: "0x408AbC192a5e9696085EBaFC7C5A88e19e66241b",
    3: "0x88880cF1c91CD117040120813D28FEdC1CeCac41",
    137: "0x909e9efE4D87d1a6018C2065aE642b6D0447bc91",
    80001: "0xCCA379FDF4Beda63c4bB0e2A3179Ae62c8716794",
  };

  // const {
  //   data: createAskData,
  //   isError: createAskError,
  //   isLoading: createAskLoading,
  //   isSuccess: createAskSuccess,
  //   write: createAskWrite,
  // } = useContractWrite({
  //   addressOrName: chainAskAddress[80001],
  //   contractInterface: Ask,
  //   functionName: 'createAsk',
  //   args: [
  //     createAsk.tokenContract,
  //     createAsk.tokenId,
  //     listingPrice,
  //     createAsk.askCurrency,
  //     createAsk.sellerFundsRecipient,
  //     createAsk.findersFeeBps,
  //   ],
  //   mode: 'recklesslyUnprepared',
  //   onError(error, variables, context) {
  //     console.log('error', error);
  //   },
  //   onSuccess(createAskData, variables, context) {
  //     console.log('Success!', createAskData);
  //   },
  // });

  useEffect(() => {
    if (data && payments) {
      form.setFieldsValue({
        currency: payments.filter((p: any) => p.chainId === data.chainID)[0]
          ?.tokenAddress,
      });
    }
  }, [form, data, payments]);

  if (!data) {
    return <Loading />;
  }

  const {
    image,
    title,
    owners,
    chainID,
    serviceFeePoint,
    serviceFeeAddress,
    marketAddress,
    royalty,
    previewImage,
  } = data;

  const setApproval = async () => {
    const signer = provider.getSigner();
    if (data.tokenStandard === "ERC-1155") {
      throw new Error("Only ERC-721 can be sold on Zora");
    }
    const erc721Contract = new Contract(
      data.contractAddress,
      ERC721Tradable,
      signer
    );
    const erc721res = await erc721Contract.setApprovalForAll(
      chainAskAddress[chainID],
      true
    );
    await erc721res.wait();
  };

  const setApprovalHelper = async () => {
    const signer = provider.getSigner();
    if (data.tokenStandard === "ERC-1155") {
      throw new Error("Only ERC-721 can be sold on Zora");
    }
    const erc721Contract = new Contract(
      data.contractAddress,
      ERC721Tradable,
      signer
    );
    const erc721res = await erc721Contract.setApprovalForAll(
      chainHelperAddress[chainID],
      true
    );
    await erc721res.wait();
  };

  const setModuleHelper = async () => {
    const signer = provider.getSigner();
    if (data.tokenStandard === "ERC-1155") {
      throw new Error("Only ERC-721 can be sold on Zora");
    }
    const erc721Contract = new Contract(
      data.contractAddress,
      ERC721Tradable,
      signer
    );
    const erc721res = await erc721Contract.setApprovalForAll(
      chainModuleAddress[chainID],
      true
    );
    await erc721res.wait();
  };

  const setApprovalFee = async () => {
    const signer = provider.getSigner();
    if (data.tokenStandard === "ERC-1155") {
      throw new Error("Only ERC-721 can be sold on Zora");
    }
    const erc721Contract = new Contract(
      data.contractAddress,
      ERC721Tradable,
      signer
    );
    const erc721res = await erc721Contract.setApprovalForAll(
      chainFeeAddress[chainID],
      true
    );
    await erc721res.wait();
  };

  const setApproval20 = async () => {
    const signer = provider.getSigner();
    if (data.tokenStandard === "ERC-1155") {
      throw new Error("Only ERC-721 can be sold on Zora");
    }
    const erc721Contract = new Contract(
      data.contractAddress,
      ERC721Tradable,
      signer
    );
    const erc721res = await erc721Contract.setApprovalForAll(
      chain20helperAddress[chainID],
      true
    );
    await erc721res.wait();
  };

  const handleFinish = async (values: any) => {
    try {
      // setCreateAsk((update) => ({
      //   ...update,
      //   tokenContract: data.contractAddress,
      //   tokenId: data.tokenId,
      //   askPrice: values.price,
      //   askCurrency: values.currency,
      // }));
      // createAskWrite();
      const signer = provider.getSigner();
      if (data.tokenStandard === "ERC-1155") {
        throw new Error("Only ERC-721 can be sold on Zora");
      }
      const askContract = new Contract(chainAskAddress[chainID], Ask, signer);
      console.log(
        data.contractAddress,
        data.tokenId,
        utils.parseEther(`${values.price}`).toString(),
        values.currency,
        createAsk.sellerFundsRecipient,
        createAsk.findersFeeBps
      );
      const res = await askContract.createAsk(
        data.contractAddress,
        data.tokenId,
        utils.parseEther(`${values.price}`).toString(),
        values.currency,
        createAsk.sellerFundsRecipient,
        createAsk.findersFeeBps
      );
      await res.wait();
      const order = {
        ...values,
        marketAddress,
        tokenAddress: data.contractAddress,
        tokenId: data.tokenId,
        maker: account,
        price: utils.parseEther(`${values.price}`).toString(),
        amount: values.amount,
        listingTime: dayjs(values.duration[0]).unix(),
        expirationTime:
          values.side !== 3 ? dayjs(values.duration[1]).unix() : 0,
        salt: BigNumber.from(utils.keccak256(utils.randomBytes(32)))
          .toBigInt()
          .toString(),
        side: values.side,
        auctionExpirationTime:
          values.side === 3 ? dayjs(values.duration[1]).unix() : 0,
        serviceFeePoint,
        serviceFeeAddress,
      };

      const hash = getOrderHash(order, data.marketAddress, chainID);

      const signature = await signer.signMessage(utils.arrayify(hash));
      await axios("/api/v1/portal/order", {
        method: "POST",
        data: {
          ...order,
          hash,
          signature,
        },
      });
      router.push(`/assets/${id}`);
    } catch (error: any) {
      console.log(error);
      message.error(error.message);
    }
  };

  return (
    <div className="container mx-auto py-2 md:py-20 lg:py-32">
      <div className="flex">
        <div className="flex-[3]">
          <DetailAsset url={image} preview={previewImage} />
          <div>
            <div className="font-title italic text-4xl">{title}</div>
          </div>
        </div>
        <div className="flex-[5] ml-10">
          <div className="font-main text-2xl">LIST WORK FOR SALE</div>
          <Form
            form={form}
            layout="vertical"
            size="large"
            requiredMark="optional"
            initialValues={{
              side: 1,
              amount: 1,
              duration: [dayjs(), dayjs().add(1, "M")],
            }}
            onFinish={handleFinish}
          >
            <Form.Item
              label="Listing Type"
              name="side"
              rules={[{ required: true }]}
            >
              <Radio.Group optionType="button" buttonStyle="solid" disabled>
                <Radio.Button value={1}>LIST FRO SALE</Radio.Button>
                <Radio.Button value={3}>BEGIN AUCTION</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Quantity"
              name="amount"
              extra={`You own ${
                owners.find(
                  (p) => p.owner.toLowerCase() === account.toLowerCase()
                ).amount
              }`}
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} precision={0} />
            </Form.Item>

            <Form.Item
              label="Price per unit"
              name="price"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0.0001}
                style={{ width: "100%" }}
                addonBefore={
                  <Form.Item name="currency" noStyle>
                    <Select style={{ width: 120 }}>
                      {payments
                        ?.filter((p: any) => p.chainId === chainID)
                        .map((item: any) => (
                          <Select.Option
                            key={item.id}
                            value={item.tokenAddress}
                          >
                            <div className="flex items-center">
                              <img
                                src={item.icon}
                                alt="currency"
                                className="w-3 shadow-none mr-1"
                              />
                              {item.name}
                            </div>
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                }
              />
            </Form.Item>
            <Form.Item
              label="Duration of listing"
              name="duration"
              rules={[{ required: true }]}
            >
              <RangePicker
                size="large"
                ranges={{
                  "One Day": [dayjs(), dayjs().add(1, "d")],
                  "One Week": [dayjs(), dayjs().add(1, "w")],
                  "One Month": [dayjs(), dayjs().add(1, "M")],
                }}
                showTime
                format="YYYY/MM/DD HH:mm:ss"
              />
            </Form.Item>
            <Form.Item label="Reserve for specific buyer(s)" name="whitelist">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <div className="flex">
                <div className="flex-1 font-bold">Fees</div>
                <div>
                  (Listing is free. Once sold, the following fees will be
                  deducted from the sale price)
                </div>
              </div>
              <div className="flex my-2">
                <div className="flex-1">Service Fee</div>
                <div>{serviceFeePoint / 10}%</div>
              </div>
              <div className="flex">
                <div className="flex-1">Creator Royalty Fee</div>
                <div>{royalty}%</div>
              </div>
            </Form.Item>
            {/* <Checkbox>Listing are final and cannot be edited or changed.</Checkbox> */}
            <Form.Item name="agreement" valuePropName="checked">
              <Checkbox>
                By ticking this box, you agree to Culture Vault&apos;s
                <Link href="/tnc">Terms and Conditions</Link>
              </Checkbox>
            </Form.Item>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.agreement !== curValues.agreement
              }
            >
              {() => (
                <Form.Item>
                  <Button
                    onClick={setApproval}
                    className="border bg-black text-white w-full font-main leading-none text-2xl p-3 disabled:bg-neutral-500 mb-5"
                  >
                    SET APPROVAL - ASKS V1.1
                  </Button>
                  <Button
                    onClick={setApprovalHelper}
                    className="border bg-black text-white w-full font-main leading-none text-2xl p-3 disabled:bg-neutral-500 mb-5"
                  >
                    SET APPROVAL - ERC721 HELPER
                  </Button>
                  <Button
                    onClick={setApproval20}
                    className="border bg-black text-white w-full font-main leading-none text-2xl p-3 disabled:bg-neutral-500 mb-5"
                  >
                    SET APPROVAL - ERC20 HELPER
                  </Button>
                  <Button
                    onClick={setModuleHelper}
                    className="border bg-black text-white w-full font-main leading-none text-2xl p-3 disabled:bg-neutral-500 mb-5"
                  >
                    SET APPROVAL - MODULE MANAGER
                  </Button>
                  <Button
                    onClick={setApprovalFee}
                    className="border bg-black text-white w-full font-main leading-none text-2xl p-3 disabled:bg-neutral-500 mb-5"
                  >
                    SET APPROVAL - FEE SETTING
                  </Button>
                  <button
                    className="border bg-black text-white w-full font-main leading-none text-2xl p-3 disabled:bg-neutral-500"
                    type="submit"
                    disabled={!form.getFieldValue("agreement")}
                  >
                    LIST WORK FOR SALE
                  </button>
                </Form.Item>
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NFTSell;
