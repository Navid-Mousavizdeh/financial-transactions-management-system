"use client";

import { increment } from "@/store/slices/counterSlice";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const count = useSelector<any>((state) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <Button onClick={() => dispatch(increment())}>{count as string}</Button>
  );
}
