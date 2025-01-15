import { useState } from "react";

const useCrudOperations = (service) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await service.getAll();
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const response = await service.getById(id);
      return response.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData) => {
    setLoading(true);
    try {
      const response = await service.create(newData);
      setData((prevData) => [...prevData, response.data]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, updatedData) => {
    setLoading(true);
    try {
      await service.update(id, updatedData);
      setData((prevData) =>
        prevData.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await service.delete(id);
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchAll, fetchById, create, update, remove };
};

export default useCrudOperations;
