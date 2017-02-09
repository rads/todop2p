(ns rads.todop2p.replikativ
  (:require [superv.async :refer [<?? S]]
            [kabel.peer :refer [start stop]]
            [konserve
             [filestore :refer [new-fs-store]]
             [memory :refer [new-mem-store]]]
            [replikativ
             [peer :refer [server-peer]]
             [stage :refer [connect! create-stage!]]]
            [replikativ.crdt.ormap.stage :as ors]
            [replikativ.crdt.ormap.realize :as real]))

(def user "mail:contact@radsmith.com") ;; will be used to authenticate you (not yet)
(def ormap-id #uuid "7d274663-9396-4247-910b-409ae35fe98d") ;; application specific datatype address

(def store-a (<?? S (new-fs-store "/tmp/test"))) ;; durable store
(def peer-a (<?? S (server-peer S store-a "ws://127.0.0.1:9090"))) ;; network and file IO
(<?? S (start peer-a))
(def stage-a (<?? S (create-stage! user peer-a))) ;; API for peer<Paste>
(<?? S (ors/create-ormap! stage-a :id ormap-id))

(def store-b (<?? S (new-mem-store))) ;; store for testing
(def peer-b (<?? S (server-peer S store-b "ws://127.0.0.1:9091")))
(<?? S (start peer-b))
(def stage-b (<?? S (create-stage! user peer-b)))
(<?? S (ors/create-ormap! stage-b :id ormap-id))

(<?? S (ors/assoc! stage-b [user ormap-id] :foo [['assoc [:foo :bars]]]))
(<?? S (ors/get stage-b [user ormap-id] :foo))

(<?? S (connect! stage-a "ws://127.0.0.1:9091")) 

(<?? S (ors/get stage-a [user ormap-id] :foo)) 
;; accordingly we can provide a dissoc operation on removal
(<?? S (ors/dissoc! stage-a [user ormap-id] :foo [['dissoc :bars]])) 
